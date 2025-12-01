import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from 'react';

// Расширяем Window interface для ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function useDataExport() {
  const [injections, setInjections] = useLocalStorage("injections", []);
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [sideEffects, setSideEffects] = useLocalStorage("sideEffects", []);
  const [injectionSites, setInjectionSites] = useLocalStorage("injectionSites", []);
  const [measurements, setMeasurements] = useLocalStorage("measurements", []);
  const [profile, setProfile] = useLocalStorage("profile", {});

  // Проверка на Android WebView (AppsGeyser и подобные)
  const isAndroidWebView = useCallback(() => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('android') && (ua.includes('wv') || ua.includes('webview'));
  }, []);

  // Проверка на мобильное устройство
  const isMobileDevice = useCallback(() => {
    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
  }, []);

  // Универсальная функция экспорта JSON
  const exportToJSON = useCallback(async () => {
    try {
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

      // Для React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'EXPORT_DATA',
          data: content,
          filename: fileName,
          mimeType: 'application/json'
        }));
        return;
      }

      // Для Android WebView (AppsGeyser) - используем data URL
      if (isAndroidWebView()) {
        const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.target = '_blank';
        link.click();
        return;
      }

      // Для обычного браузера
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      throw new Error("Не удалось экспортировать данные");
    }
  }, [profile, injections, weights, sideEffects, injectionSites, measurements, isAndroidWebView]);

  // Универсальная функция экспорта CSV
  const exportToCSV = useCallback(async (dataType: "injections" | "weights" | "sideEffects") => {
    try {
      let data: any[] = [];
      let headers: string[] = [];
      let fileName = '';

      switch (dataType) {
        case "injections":
          data = injections;
          headers = ["Дата", "Доза", "Место укола", "Комментарий"];
          fileName = `injections-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case "weights":
          data = weights;
          headers = ["Дата", "Вес"];
          fileName = `weights-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case "sideEffects":
          data = sideEffects;
          headers = ["Дата", "Комментарий"];
          fileName = `side-effects-${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }

      if (data.length === 0) {
        throw new Error("Нет данных для экспорта");
      }

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

      // Для React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'EXPORT_DATA',
          data: csvContent,
          filename: fileName,
          mimeType: 'text/csv'
        }));
        return;
      }

      // Для Android WebView (AppsGeyser)
      if (isAndroidWebView()) {
        const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.target = '_blank';
        link.click();
        return;
      }

      // Для обычного браузера
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV Export error:", error);
      throw new Error("Не удалось экспортировать CSV данные");
    }
  }, [injections, weights, sideEffects, isAndroidWebView]);

  // Функция импорта
  const importFromJSON = useCallback((file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
          }

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
  }, [setInjections, setWeights, setSideEffects, setInjectionSites, setMeasurements, setProfile]);

  // Универсальная функция поделиться JSON
  const shareJSON = useCallback(async () => {
    try {
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

      // Для React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SHARE_DATA',
          data: content,
          filename: fileName,
          mimeType: 'application/json'
        }));
        return { method: 'native-share' } as const;
      }

      // Пробуем Web Share API (работает в большинстве мобильных браузеров и WebView)
      if (navigator.share) {
        try {
          // Сначала пробуем поделиться файлом
          if (navigator.canShare) {
            const blob = new Blob([content], { type: "application/json" });
            const file = new File([blob], fileName, { type: "application/json" });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Экспорт данных',
              });
              return { method: 'native-share' } as const;
            }
          }
          
          // Fallback: делимся текстом
          await navigator.share({
            title: 'Экспорт данных Shot Track Buddy',
            text: content,
          });
          return { method: 'native-share' } as const;
        } catch (shareError: any) {
          // Пользователь отменил - не показываем ошибку
          if (shareError?.name === 'AbortError') {
            return { method: 'cancelled' } as const;
          }
          console.log('Web Share API error:', shareError);
        }
      }

      // Fallback для Android WebView - открываем intent
      if (isAndroidWebView() || isMobileDevice()) {
        // Пробуем Android intent для текста
        const intentUrl = `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${encodeURIComponent(content)};S.android.intent.extra.SUBJECT=Экспорт данных Shot Track Buddy;end`;
        
        try {
          window.location.href = intentUrl;
          return { method: 'intent' } as const;
        } catch {
          // Intent не сработал, используем копирование
        }
      }

      // Финальный fallback - скачивание файла
      if (isAndroidWebView()) {
        const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.target = '_blank';
        link.click();
      } else {
        const blob = new Blob([content], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      return { method: 'download' } as const;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { method: 'cancelled' } as const;
      }
      console.error("Share error:", error);
      throw new Error("Не удалось поделиться данными");
    }
  }, [profile, injections, weights, sideEffects, injectionSites, measurements, isAndroidWebView, isMobileDevice]);

  // Функция копирования в буфер обмена
  const copyJSONToClipboard = useCallback(async () => {
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

    try {
      await navigator.clipboard.writeText(content);
      return { method: 'clipboard' } as const;
    } catch {
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
  }, [profile, injections, weights, sideEffects, injectionSites, measurements]);

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
    shareJSON,
    copyJSONToClipboard,
  };
}
