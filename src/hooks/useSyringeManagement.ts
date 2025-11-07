import { useLocalStorage } from "./useLocalStorage";
import { addDays } from "date-fns";

export interface Syringe {
  id: string;
  startDate: string;
  capacity: number; // в мл
  type: '0.25-0.5' | '1.0'; // какие деления есть на шприце
  isActive: boolean;
}

export interface SyringeStatus {
  currentSyringe: Syringe | null;
  remainingVolume: number;
  usedVolume: number;
  remainingInjections: number;
  dateToReplace: Date | null;
  allSyringes: Syringe[];
}

export function useSyringeManagement() {
  const [syringes, setSyringes] = useLocalStorage<Syringe[]>("syringes", []);
  const [injections] = useLocalStorage<any[]>("injections", []);

  // Конвертация дозы в объем в зависимости от типа шприца
  const doseToVolume = (dose: string, syringeType: '0.25-0.5' | '1.0'): number => {
    const doseNum = parseFloat(dose);
    
    if (syringeType === '0.25-0.5') {
      // Для шприца с делениями 0.25 и 0.5
      // 0.25мг = 0.25мл, 0.5мг = 0.5мл, 1мг = 1мл, 1.5мг = 1.5мл
      return doseNum;
    } else {
      // Для шприца с делением 1.0
      // 1мг = 1мл, 1.5мг = 1.5мл
      return doseNum;
    }
  };

  // Расчет статуса текущего шприца
  const calculateSyringeStatus = (): SyringeStatus => {
    const currentSyringe = syringes.find(s => s.isActive);
    
    if (!currentSyringe) {
      return {
        currentSyringe: null,
        remainingVolume: 0,
        usedVolume: 0,
        remainingInjections: 0,
        dateToReplace: null,
        allSyringes: syringes,
      };
    }

    // Фильтруем инъекции после начала использования текущего шприца
    const syringeInjections = injections.filter(
      (inj) => new Date(inj.date) >= new Date(currentSyringe.startDate)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Рассчитываем использованный объем
    let usedVolume = 0;
    for (const inj of syringeInjections) {
      usedVolume += doseToVolume(inj.dose, currentSyringe.type);
    }

    const remainingVolume = Math.max(0, currentSyringe.capacity - usedVolume);

    // Находим последнюю дозу для прогноза
    const lastDose = syringeInjections.length > 0 
      ? parseFloat(syringeInjections[syringeInjections.length - 1].dose)
      : 0;

    // Рассчитываем сколько инъекций текущей дозы можно еще сделать
    const remainingInjections = lastDose > 0 
      ? Math.floor(remainingVolume / doseToVolume(lastDose.toString(), currentSyringe.type))
      : 0;

    // Прогнозируем дату замены (предполагая инъекции каждые 7 дней)
    let dateToReplace: Date | null = null;
    if (syringeInjections.length > 0 && remainingInjections > 0) {
      const lastInjectionDate = new Date(syringeInjections[syringeInjections.length - 1].date);
      dateToReplace = addDays(lastInjectionDate, (remainingInjections - 1) * 7);
    }

    return {
      currentSyringe,
      remainingVolume,
      usedVolume,
      remainingInjections,
      dateToReplace,
      allSyringes: syringes,
    };
  };

  // Добавить новый шприц
  const addSyringe = (syringe: Omit<Syringe, 'id'>) => {
    const newSyringe: Syringe = {
      ...syringe,
      id: Date.now().toString(),
    };

    // Деактивируем все предыдущие шприцы если новый активен
    const updatedSyringes = syringe.isActive
      ? syringes.map(s => ({ ...s, isActive: false }))
      : syringes;

    setSyringes([...updatedSyringes, newSyringe]);
  };

  // Активировать шприц
  const activateSyringe = (id: string) => {
    setSyringes(
      syringes.map(s => ({
        ...s,
        isActive: s.id === id,
      }))
    );
  };

  // Удалить шприц
  const deleteSyringe = (id: string) => {
    setSyringes(syringes.filter(s => s.id !== id));
  };

  // Обновить шприц
  const updateSyringe = (id: string, updates: Partial<Syringe>) => {
    setSyringes(
      syringes.map(s => {
        if (s.id === id) {
          // Если делаем шприц активным, деактивируем остальные
          if (updates.isActive) {
            return { ...s, ...updates };
          }
          return { ...s, ...updates };
        }
        // Деактивируем другие шприцы если обновляемый стал активным
        if (updates.isActive) {
          return { ...s, isActive: false };
        }
        return s;
      })
    );
  };

  return {
    syringes,
    calculateSyringeStatus,
    addSyringe,
    activateSyringe,
    deleteSyringe,
    updateSyringe,
  };
}
