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

  // Улучшенная проверка на Android WebView (AppsGeyser, TWA и подобные)
  const isAndroidWebView = useCallback(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    // Проверяем на Android
    if (!ua.includes('android')) return false;
    
    // Явные маркеры WebView
    if (ua.includes('wv') || ua.includes('webview')) return true;
    
    // AppsGeyser и другие обёртки часто не добавляют 'wv', но:
    // 1. Отсутствует Chrome/Firefox/Samsung Browser и т.д.
    // 2. Или присутствует Version/X.X (старый Android Browser / WebView)
    const hasBrowserMarker = 
      (ua.includes('chrome') && !ua.includes('version/')) ||
      ua.includes('firefox') ||
      ua.includes('samsungbrowser') ||
      ua.includes('opera') ||
      ua.includes('ucbrowser') ||
      ua.includes('edge');
    
    // Если Android но нет маркера браузера - скорее всего WebView
    if (!hasBrowserMarker) return true;
    
    // Проверка на standalone режим (PWA/TWA)
    if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
    
    return false;
  }, []);

  // Проверка на мобильное устройство
  const isMobileDevice = useCallback(() => {
    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
  }, []);

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

  // Универсальная функция экспорта JSON
  const exportToJSON = useCallback(async () => {
    try {
      const data = getExportData();
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
        return { method: 'rn-webview' };
      }

      // Для Android WebView (AppsGeyser и подобных) - копируем в буфер
      if (isAndroidWebView()) {
        // Пробуем clipboard API
        try {
          await navigator.clipboard.writeText(content);
          return { method: 'clipboard', message: 'JSON скопирован в буфер обмена. Вставьте в заметки или отправьте через мессенджер.' };
        } catch {
          // Fallback через textarea
          const textarea = document.createElement('textarea');
          textarea.value = content;
          textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (ok) {
            return { method: 'clipboard', message: 'JSON скопирован в буфер обмена. Вставьте в заметки или отправьте через мессенджер.' };
          }
        }
        
        // Если копирование не сработало - открываем в новой вкладке для ручного копирования
        const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
        window.open(dataUrl, '_blank');
        return { method: 'open', message: 'Данные открыты в новой вкладке. Скопируйте текст вручную.' };
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
      return { method: 'download' };
    } catch (error) {
      console.error("Export error:", error);
      throw new Error("Не удалось экспортировать данные");
    }
  }, [getExportData, isAndroidWebView]);

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

      // Для Android WebView (AppsGeyser) - копируем в буфер
      if (isAndroidWebView()) {
        try {
          await navigator.clipboard.writeText(csvContent);
          return { method: 'clipboard', message: 'CSV скопирован в буфер обмена.' };
        } catch {
          const textarea = document.createElement('textarea');
          textarea.value = csvContent;
          textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (ok) {
            return { method: 'clipboard', message: 'CSV скопирован в буфер обмена.' };
          }
        }
        
        const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        window.open(dataUrl, '_blank');
        return { method: 'open', message: 'Данные открыты в новой вкладке.' };
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
      return { method: 'download' };
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
      const data = getExportData();
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
        return { method: 'native-share' };
      }

      // Для Android WebView - сразу копируем в буфер (надёжнее всего)
      if (isAndroidWebView()) {
        try {
          await navigator.clipboard.writeText(content);
          return { method: 'clipboard', message: 'JSON скопирован в буфер обмена. Вставьте в мессенджер или заметки.' };
        } catch {
          const textarea = document.createElement('textarea');
          textarea.value = content;
          textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (ok) {
            return { method: 'clipboard', message: 'JSON скопирован в буфер обмена. Вставьте в мессенджер или заметки.' };
          }
        }
        
        // Открываем в новой вкладке для ручного копирования
        const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
        window.open(dataUrl, '_blank');
        return { method: 'open', message: 'Данные открыты. Скопируйте и отправьте через мессенджер.' };
      }

      // Пробуем Web Share API для не-WebView окружений
      if (navigator.share) {
        try {
          if (navigator.canShare) {
            const blob = new Blob([content], { type: "application/json" });
            const file = new File([blob], fileName, { type: "application/json" });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Экспорт данных',
              });
              return { method: 'share-files' };
            }
          }
          
          await navigator.share({
            title: 'Экспорт данных Shot Track Buddy',
            text: content,
          });
          return { method: 'share-text' };
        } catch (shareError: any) {
          if (shareError?.name === 'AbortError') {
            throw new Error('Отменено пользователем');
          }
          console.log('Web Share API error:', shareError);
        }
      }

      // Финальный fallback - скачивание
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { method: 'download' };
    } catch (error: any) {
      if (error?.message === 'Отменено пользователем') {
        throw error;
      }
      console.error("Share error:", error);
      throw new Error("Не удалось поделиться данными");
    }
  }, [getExportData, isAndroidWebView]);

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
