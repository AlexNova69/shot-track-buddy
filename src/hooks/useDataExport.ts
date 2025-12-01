import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from 'react';
import JSZip from 'jszip';

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

  // Получаем данные для экспорта
  const getExportData = useCallback(() => {
    return {
      profile,
      injections,
      weights,
      sideEffects,
      injectionSites,
      measurements,
      exportDate: new Date().toISOString(),
    };
  }, [profile, injections, weights, sideEffects, injectionSites, measurements]);

  // Создание ZIP архива с JSON данными
  const createZipArchive = useCallback(async () => {
    const data = getExportData();
    const jsonContent = JSON.stringify(data, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const zip = new JSZip();
    zip.file(`injection-tracker-${dateStr}.json`, jsonContent);
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = `injection-tracker-${dateStr}.zip`;
    
    return { zipBlob, zipFileName, jsonContent };
  }, [getExportData]);

  // Универсальная функция экспорта ZIP
  const exportToJSON = useCallback(async () => {
    try {
      const { zipBlob, zipFileName } = await createZipArchive();

      // Для React Native WebView
      if (window.ReactNativeWebView) {
        const base64 = await blobToBase64(zipBlob);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'EXPORT_DATA',
          data: base64,
          filename: zipFileName,
          mimeType: 'application/zip',
          isBase64: true
        }));
        return { method: 'rn-webview' };
      }

      // Для всех браузеров и WebView - скачивание через blob URL
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Задержка перед очисткой
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return { method: 'download', message: `ZIP архив "${zipFileName}" скачан` };
    } catch (error) {
      console.error("Export error:", error);
      throw new Error("Не удалось экспортировать данные");
    }
  }, [createZipArchive]);

  // Вспомогательная функция для конвертации Blob в Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

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
        return { method: 'rn-webview' };
      }

      // Для всех браузеров - скачивание
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return { method: 'download' };
    } catch (error) {
      console.error("CSV Export error:", error);
      throw new Error("Не удалось экспортировать CSV данные");
    }
  }, [injections, weights, sideEffects]);

  // Функция импорта (поддержка JSON и ZIP)
  const importFromJSON = useCallback(async (file: File) => {
    try {
      let jsonContent: string;
      
      // Если это ZIP файл - распаковываем
      if (file.name.endsWith('.zip') || file.type === 'application/zip') {
        const zip = await JSZip.loadAsync(file);
        const jsonFile = Object.keys(zip.files).find(name => name.endsWith('.json'));
        
        if (!jsonFile) {
          throw new Error('JSON файл не найден в архиве');
        }
        
        jsonContent = await zip.files[jsonFile].async('string');
      } else {
        // Обычный JSON файл
        jsonContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }
      
      const data = JSON.parse(jsonContent);
      
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

      return data;
    } catch (error) {
      throw error;
    }
  }, [setInjections, setWeights, setSideEffects, setInjectionSites, setMeasurements, setProfile]);

  // Универсальная функция поделиться ZIP
  const shareJSON = useCallback(async () => {
    try {
      const { zipBlob, zipFileName } = await createZipArchive();

      // Для React Native WebView
      if (window.ReactNativeWebView) {
        const base64 = await blobToBase64(zipBlob);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SHARE_DATA',
          data: base64,
          filename: zipFileName,
          mimeType: 'application/zip',
          isBase64: true
        }));
        return { method: 'native-share' };
      }

      // Пробуем Web Share API
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([zipBlob], zipFileName, { type: "application/zip" });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Экспорт данных Shot Track Buddy',
            });
            return { method: 'share-files' };
          }
        } catch (shareError: any) {
          if (shareError?.name === 'AbortError') {
            throw new Error('Отменено пользователем');
          }
          console.log('Web Share API error:', shareError);
        }
      }

      // Fallback - скачивание
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return { method: 'download', message: `ZIP архив "${zipFileName}" скачан` };
    } catch (error: any) {
      if (error?.message === 'Отменено пользователем') {
        throw error;
      }
      console.error("Share error:", error);
      throw new Error("Не удалось поделиться данными");
    }
  }, [createZipArchive]);

  // Функция копирования в буфер обмена
  const copyJSONToClipboard = useCallback(async () => {
    const data = getExportData();
    const content = JSON.stringify(data, null, 2);

    try {
      await navigator.clipboard.writeText(content);
      return { method: 'clipboard' };
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand copy failed');
        return { method: 'copy-textarea' };
      } catch (e) {
        throw new Error('Не удалось скопировать данные.');
      }
    }
  }, [getExportData]);

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
    shareJSON,
    copyJSONToClipboard,
  };
}
