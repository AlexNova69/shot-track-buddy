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

    if (Capacitor.isNativePlatform()) {
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
          title: 'Export Data',
          text: 'Injection Tracker Data Export',
          files: [result.uri],
          dialogTitle: 'Save your data',
        });
      } catch (error) {
        console.error('Error exporting file:', error);
        throw error;
      }
    } else {
      // Web/WebView: prefer Share API; fallback to download
      try {
        const blob = new Blob([content], { type: "application/json" });
        const file = new File([blob], fileName, { type: "application/json" });
        const navAny = navigator as any;
        const ua = (typeof navigator !== "undefined" && navigator.userAgent) ? navigator.userAgent : "";
        const isAndroidWebView = /Android/i.test(ua) && /wv/i.test(ua);

        // 1) Share with files (if supported)
        if (typeof navigator !== "undefined" && "share" in navigator) {
          if (!navAny.canShare || navAny.canShare({ files: [file] })) {
            try {
              await navAny.share({
                title: 'Export Data',
                text: 'Injection Tracker Data Export',
                files: [file],
              });
              return;
            } catch {}
          }
        }

        // 2) Share as URL/text (works better on some WebViews like AppsGeyser)
        if (typeof navigator !== "undefined" && "share" in navigator) {
          const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
          try {
            await navAny.share({
              title: 'Export Data',
              text: 'Injection Tracker Data Export',
              url: dataUrl,
            });
            return;
          } catch {}
          // As a last share attempt, send plain text
          try {
            await navAny.share({
              title: 'Export Data',
              text: `${fileName}\n\n${content}`,
            });
            return;
          } catch {}
        }

        // 3) Fallback: programmatic download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    if (Capacitor.isNativePlatform()) {
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
          title: 'Export CSV',
          text: `${dataType} Data Export`,
          files: [result.uri],
          dialogTitle: 'Save your CSV data',
        });
      } catch (error) {
        console.error('Error exporting CSV file:', error);
        throw error;
      }
    } else {
      // Web/WebView: prefer Share API; fallback to download
      try {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const file = new File([blob], fileName, { type: "text/csv;charset=utf-8;" });
        const navAny = navigator as any;
        const ua = (typeof navigator !== "undefined" && navigator.userAgent) ? navigator.userAgent : "";
        const isAndroidWebView = /Android/i.test(ua) && /wv/i.test(ua);

        // 1) Share with files (if supported)
        if (typeof navigator !== "undefined" && "share" in navigator) {
          if (!navAny.canShare || navAny.canShare({ files: [file] })) {
            try {
              await navAny.share({
                title: 'Export CSV',
                text: `${dataType} Data Export`,
                files: [file],
              });
              return;
            } catch {}
          }
        }

        // 2) Share as URL/text (works better on some WebViews like AppsGeyser)
        if (typeof navigator !== "undefined" && "share" in navigator) {
          const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
          try {
            await navAny.share({
              title: 'Export CSV',
              text: `${dataType} Data Export`,
              url: dataUrl,
            });
            return;
          } catch {}
          // As a last share attempt, send plain text
          try {
            await navAny.share({
              title: 'Export CSV',
              text: `${fileName}\n\n${csvContent}`,
            });
            return;
          } catch {}
        }

        // 3) Fallback: programmatic download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    // 1) Native: использовать Capacitor Share + Filesystem если доступно
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: 'Экспорт данных Injection Tracker',
          text: 'Экспорт JSON',
          files: [result.uri],
        });
        return { method: 'native-share' } as const;
      } catch (error) {
        console.error('Native share failed:', error);
        // Падать не будем — продолжим веб-фолбэками
      }
    }

    // 2) Web/WebView
    try {
      const blob = new Blob([content], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });
      const navAny = navigator as any;

      // 2a) Пытаемся share с файлами
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        if (!navAny?.canShare || navAny.canShare({ files: [file] })) {
          try {
            await navAny.share({
              title: 'Экспорт данных Injection Tracker',
              text: 'Экспорт JSON',
              files: [file],
            });
            return { method: 'share-files' } as const;
          } catch (e) {
            // Продолжаем к следующим вариантам
          }
        }

        // 2b) Share с data:URL
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
        try {
          await navAny.share({
            title: 'Экспорт данных Injection Tracker',
            text: fileName,
            url: dataUrl,
          });
          return { method: 'share-url' } as const;
        } catch (e) {
          // Продолжаем к тексту
        }

        // 2c) Share как текст
        try {
          await navAny.share({
            title: 'Экспорт данных Injection Tracker',
            text: `${fileName}\n\n${content}`,
          });
          return { method: 'share-text' } as const;
        } catch (e) {
          // Продолжаем к локальным фолбэкам без ошибок пользователю
        }
      }

      // 3) Фолбэк: программная загрузка файла
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
      } catch (e) {
        // 4) Фолбэк: открыть в новой вкладке (чтобы сохранить/шарить из меню)
        try {
          const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
          window.open(dataUrl, '_blank');
          return { method: 'open' } as const;
        } catch (e2) {
          // 5) Фолбэк: буфер обмена
          try {
            await navigator.clipboard.writeText(content);
            return { method: 'clipboard' } as const;
          } catch (e3) {
            throw new Error('Не удалось поделиться или сохранить файл');
          }
        }
      }
    } catch (error) {
      console.error('Web share/download failed:', error);
      throw error;
    }
  };

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
    shareJSON,
  };
}