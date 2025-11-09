import { useLocalStorage } from "./useLocalStorage";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export function useDataExport() {
  const [injections, setInjections] = useLocalStorage("injections", []);
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [sideEffects, setSideEffects] = useLocalStorage("sideEffects", []);
  const [injectionSites, setInjectionSites] = useLocalStorage("injectionSites", []);
  const [measurements, setMeasurements] = useLocalStorage("measurements", []);
  const [profile, setProfile] = useLocalStorage("profile", {});

  // Проверка на мобильное устройство (Android/iOS)
  const isMobileDevice = () => {
    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod/i.test(ua) || Capacitor.isNativePlatform();
  };

  const exportToJSON = async () => {
    const data = {
      profile,
      injections,
      weights,
      sideEffects,
      injectionSites,
      measurements,
      exportDate: new Date().toISOString(),
    };

    const fileName = `injection-tracker-${new Date().toISOString().split('T')[0]}.json`;
    const content = JSON.stringify(data, null, 2);

    // Используем Capacitor API для мобильных устройств
    if (isMobileDevice()) {
      try {
        // Write file temporarily
        const result = await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        // Share the file using native share dialog
        await Share.share({
          title: 'Экспорт данных',
          text: 'Injection Tracker - экспорт данных',
          files: [result.uri],
          dialogTitle: 'Сохранить данные',
        });
      } catch (error) {
        console.error('Error exporting file:', error);
        throw error;
      }
    } else {
      // Web/WebView: download-first strategy with resilient fallbacks (AppsGeyser safe)
      try {
        const blob = new Blob([content], { type: 'application/json' });
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
        const isAndroidWebView = /Android/i.test(ua) && /wv/i.test(ua);

        // a) Direct download (skip Web Share to avoid "data transfer" errors in Android WebView)
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        } catch {}

        // b) Open data URL (lets user save/share from menu)
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
        try {
          const win = window.open(dataUrl, '_blank');
          if (win) return;
        } catch {}
        try {
          window.location.href = dataUrl;
          return;
        } catch {}

        // c) Clipboard fallback
        try {
          await navigator.clipboard.writeText(content);
          return;
        } catch {}

        throw new Error('Web export failed');
      } catch (err) {
        console.error('Web export failed:', err);
        throw err;
      }
    }
  };

  const exportToCSV = async (dataType: "injections" | "weights" | "sideEffects") => {
    let data: any[] = [];
    let headers: string[] = [];

    switch (dataType) {
      case "injections":
        data = injections;
        headers = ["Дата", "Доза", "Место укола", "Комментарий"];
        break;
      case "weights":
        data = weights;
        headers = ["Дата", "Вес"];
        break;
      case "sideEffects":
        data = sideEffects;
        headers = ["Дата", "Комментарий"];
        break;
    }

    if (data.length === 0) return;

    const csvContent = [
      headers.join(","),
      ...data.map(row => {
        switch (dataType) {
          case "injections":
            return [row.date, row.dose, row.site, `"${row.comment || ""}"`].join(",");
          case "weights":
            return [row.date, row.weight].join(",");
          case "sideEffects":
            return [row.date, `"${row.comment || ""}"`].join(",");
          default:
            return "";
        }
      })
    ].join("\n");

    const fileName = `${dataType}-${new Date().toISOString().split('T')[0]}.csv`;

    // Используем Capacitor API для мобильных устройств
    if (isMobileDevice()) {
      try {
        // Write file temporarily
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        // Share the file using native share dialog
        await Share.share({
          title: 'Экспорт CSV',
          text: `Экспорт данных: ${dataType}`,
          files: [result.uri],
          dialogTitle: 'Сохранить CSV данные',
        });
      } catch (error) {
        console.error('Error exporting CSV file:', error);
        throw error;
      }
    } else {
      // Web/WebView: download-first strategy with resilient fallbacks (AppsGeyser safe)
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
        const isAndroidWebView = /Android/i.test(ua) && /wv/i.test(ua);

        // a) Direct download (skip Web Share in Android WebView)
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        } catch {}

        // b) Open data URL
        const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
        try {
          const win = window.open(dataUrl, '_blank');
          if (win) return;
        } catch {}
        try {
          window.location.href = dataUrl;
          return;
        } catch {}

        // c) Clipboard fallback
        try {
          await navigator.clipboard.writeText(csvContent);
          return;
        } catch {}

        throw new Error('Web CSV export failed');
      } catch (err) {
        console.error('Web CSV export failed:', err);
        throw err;
      }
    }
  };

  const importFromJSON = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Validate data structure
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
          }

          // Import data if present
          if (data.injections && Array.isArray(data.injections)) {
            setInjections(data.injections);
          }
          if (data.weights && Array.isArray(data.weights)) {
            setWeights(data.weights);
          }
          if (data.sideEffects && Array.isArray(data.sideEffects)) {
            setSideEffects(data.sideEffects);
          }
          if (data.injectionSites && Array.isArray(data.injectionSites)) {
            setInjectionSites(data.injectionSites);
          }
          if (data.measurements && Array.isArray(data.measurements)) {
            setMeasurements(data.measurements);
          }
          if (data.profile && typeof data.profile === 'object') {
            setProfile(data.profile);
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const shareJSON = async () => {
    const data = {
      profile,
      injections,
      weights,
      sideEffects,
      injectionSites,
      measurements,
      exportDate: new Date().toISOString(),
    };

    const fileName = `injection-tracker-${new Date().toISOString().split('T')[0]}.json`;
    const content = JSON.stringify(data, null, 2);

    // 1) Используем Capacitor API для мобильных устройств
    if (isMobileDevice()) {
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: 'Экспорт данных',
          text: 'Injection Tracker - экспорт данных',
          files: [result.uri],
          dialogTitle: 'Поделиться файлом',
        });
        return { method: 'native-share' } as const;
      } catch (error) {
        console.error('Native share failed:', error);
        throw new Error('Не удалось открыть системное меню для передачи файла');
      }
    }

    // 2) Web/WebView: пытаемся использовать Web Share API с файлом
    const blob = new Blob([content], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    // 2a) Агрессивно пытаемся использовать navigator.share с файлом
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        // Пытаемся поделиться файлом напрямую
        await navigator.share({
          title: 'Экспорт данных',
          text: 'Injection Tracker - экспорт данных',
          files: [file],
        });
        return { method: 'share-files' } as const;
      } catch (shareError: any) {
        console.error('Share API with file failed:', shareError);
        
        // Если пользователь отменил - не показываем ошибку
        if (shareError?.name === 'AbortError') {
          throw new Error('Отменено пользователем');
        }
        
        // Если share не поддерживает файлы, переходим к fallback
        // Не выбрасываем ошибку, продолжаем к загрузке
      }
    }

    // 3) Фолбэк: программная загрузка файла (для браузеров без Web Share API)
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { method: 'download' } as const;
    } catch (downloadError) {
      console.error('Download fallback failed:', downloadError);
      
      // 4) Крайний фолбэк: открыть data URL в новой вкладке
      try {
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
        const opened = window.open(dataUrl, '_blank');
        if (opened) {
          return { method: 'open' } as const;
        }
      } catch (openError) {
        console.error('Open data URL failed:', openError);
      }
      
      throw new Error('Не удалось поделиться файлом. Попробуйте использовать кнопку "Экспортировать всё" вместо этого.');
    }
  };

  // Simple clipboard export that avoids file system/share permissions
  const copyJSONToClipboard = async () => {
    const data = {
      profile,
      injections,
      weights,
      sideEffects,
      injectionSites,
      measurements,
      exportDate: new Date().toISOString(),
    };
    const content = JSON.stringify(data, null, 2);

    // Try modern clipboard API first
    try {
      await navigator.clipboard.writeText(content);
      return { method: 'clipboard' } as const;
    } catch {
      // Fallback: hidden textarea selection
      try {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand copy failed');
        return { method: 'copy-textarea' } as const;
      } catch (e) {
        throw new Error('Не удалось скопировать данные.');
      }
    }
  };

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
    shareJSON,
    copyJSONToClipboard,
  };
}