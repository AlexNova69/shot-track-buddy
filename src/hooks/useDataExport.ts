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

  // Универсальная проверка платформы
  const isNativeApp = useCallback(() => {
    return typeof window !== 'undefined' && window.ReactNativeWebView;
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

      // Для нативного приложения (APK)
      if (isNativeApp()) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'EXPORT_DATA',
          data: content,
          filename: fileName,
          mimeType: 'application/json'
        }));
        return;
      }

      // Для веб-версии - стандартный подход
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
  }, [profile, injections, weights, sideEffects, injectionSites, measurements, isNativeApp]);

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

      // Для нативного приложения (APK)
      if (isNativeApp()) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'EXPORT_DATA',
          data: csvContent,
          filename: fileName,
          mimeType: 'text/csv'
        }));
        return;
      }

      // Для веб-версии
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
  }, [injections, weights, sideEffects, isNativeApp]);

  // Функция импорта (остается без изменений)
  const importFromJSON = useCallback((file: File) => {
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

      // Для нативного приложения (APK)
      if (isNativeApp()) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'SHARE_DATA',
          data: content,
          filename: fileName,
          mimeType: 'application/json'
        }));
        return { method: 'native-share' } as const;
      }

      // Для веб-версии - пробуем Web Share API
      if (navigator.share && navigator.canShare) {
        try {
          const blob = new Blob([content], { type: "application/json" });
          const file = new File([blob], fileName, { type: "application/json" });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Экспорт данных Semaglutide Tracker',
              text: 'Мои данные о применении семаглутида'
            });
            return { method: 'native-share' } as const;
          }
        } catch (shareError) {
          console.log('Web Share API не поддерживается, используем fallback');
        }
      }

      // Fallback для веб-версии - скачивание
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { method: 'download' } as const;
    } catch (error) {
      console.error("Share error:", error);
      throw new Error("Не удалось поделиться данными");
    }
  }, [profile, injections, weights, sideEffects, injectionSites, measurements, isNativeApp]);

  // Функция копирования в буфер обмена (остается без изменений)
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
  }, [profile, injections, weights, sideEffects, injectionSites, measurements]);

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
    shareJSON,
    copyJSONToClipboard,
  };
}
