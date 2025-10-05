import { useLocalStorage } from "./useLocalStorage";

export function useDataExport() {
  const [injections, setInjections] = useLocalStorage("injections", []);
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [sideEffects, setSideEffects] = useLocalStorage("sideEffects", []);
  const [injectionSites, setInjectionSites] = useLocalStorage("injectionSites", []);
  const [profile, setProfile] = useLocalStorage("profile", {});

  const exportToJSON = () => {
    const data = {
      profile,
      injections,
      weights,
      sideEffects,
      injectionSites,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `injection-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (dataType: "injections" | "weights" | "sideEffects") => {
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

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
  };
}