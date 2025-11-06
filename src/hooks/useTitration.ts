import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

// Titration scheme: dose - number of injections
const TITRATION_SCHEME = [
  { dose: 0.25, injections: 4, week: "1-4" },
  { dose: 0.5, injections: 4, week: "5-8" },
  { dose: 1.0, injections: 4, week: "9-12" },
  { dose: 1.75, injections: 4, week: "13-16" },
];

const MAINTENANCE_DOSE = 1.75;
const SYRINGE_CAPACITY = 3; // ml

export interface TitrationStep {
  dose: number;
  injections: number;
  week: string;
  completed: number;
  remaining: number;
  isActive: boolean;
}

export interface SyringeCalculation {
  division: number; // 0.25, 0.5, or 1.0
  dosesPerSyringe: number;
  injectionsNeeded: number;
  syringesNeeded: number;
}

export interface SyringeUsageSchedule {
  syringeNumber: number;
  startInjection: number;
  endInjection: number;
  totalVolume: number;
  injectionsCount: number;
  needNewSyringe: boolean;
}

export interface CurrentSyringeInfo {
  remainingVolume: number;
  dateToReplaceBy: Date | null;
  injectionsRemaining: number;
  syringeNumber: number;
}

export interface DoseBreakdown {
  dose: number;
  shots025: number; // количество уколов по 0.25
  shots05: number;  // количество уколов по 0.5
  totalShots: number;
  remainingInjectionsForThisDose: number; // сколько раз можно сделать эту дозу из оставшегося объема
}

export function useTitration() {
  const [injections] = useLocalStorage("injections", []);

  const titrationData = useMemo(() => {
    const totalInjections = injections.length;
    
    // Calculate current step and progress
    let completedInjections = 0;
    const steps: TitrationStep[] = TITRATION_SCHEME.map((scheme, index) => {
      const startInjection = completedInjections;
      const endInjection = startInjection + scheme.injections;
      const completed = Math.min(
        Math.max(0, totalInjections - startInjection),
        scheme.injections
      );
      const isActive = totalInjections >= startInjection && totalInjections < endInjection;
      
      completedInjections = endInjection;
      
      return {
        ...scheme,
        completed,
        remaining: scheme.injections - completed,
        isActive,
      };
    });

    // Current dose
    const currentDose = steps.find(s => s.isActive)?.dose || MAINTENANCE_DOSE;
    
    // Calculate next injections (future schedule)
    const futureSchedule = [];
    if (injections.length > 0) {
      const lastInjection = injections[injections.length - 1];
      const lastDate = new Date(lastInjection.date);
      
      let injectionCount = totalInjections;
      for (let i = 0; i < 12; i++) { // Show next 12 injections
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + (i + 1) * 7); // Weekly injections
        
        // Determine dose for this injection
        let dose = MAINTENANCE_DOSE;
        let accumulatedInjections = 0;
        for (const scheme of TITRATION_SCHEME) {
          if (injectionCount < accumulatedInjections + scheme.injections) {
            dose = scheme.dose;
            break;
          }
          accumulatedInjections += scheme.injections;
        }
        
        futureSchedule.push({
          date: nextDate,
          dose,
          injectionNumber: injectionCount + 1,
        });
        
        injectionCount++;
      }
    }

    // Calculate syringe usage for current dose
    const calculateSyringeUsage = (division: number): SyringeCalculation => {
      const dosesPerSyringe = SYRINGE_CAPACITY / division;
      const activeStep = steps.find(s => s.isActive);
      const injectionsNeeded = activeStep?.remaining || 0;
      const syringesNeeded = Math.ceil((injectionsNeeded * currentDose) / SYRINGE_CAPACITY);
      
      return {
        division,
        dosesPerSyringe,
        injectionsNeeded,
        syringesNeeded,
      };
    };

    // Calculate syringe usage schedule from first injection
    const calculateSyringeSchedule = (division: number): SyringeUsageSchedule[] => {
      const schedule: SyringeUsageSchedule[] = [];
      let currentSyringeVolume = SYRINGE_CAPACITY;
      let syringeNumber = 1;
      let startInjection = 1;
      let injectionsInCurrentSyringe = 0;
      
      // Go through all titration steps (16 injections total)
      const totalPlannedInjections = TITRATION_SCHEME.reduce((sum, s) => sum + s.injections, 0);
      
      for (let i = 1; i <= totalPlannedInjections; i++) {
        // Determine dose for this injection
        let dose = MAINTENANCE_DOSE;
        let accumulatedInjections = 0;
        for (const scheme of TITRATION_SCHEME) {
          if (i <= accumulatedInjections + scheme.injections) {
            dose = scheme.dose;
            break;
          }
          accumulatedInjections += scheme.injections;
        }
        
        // Check if current syringe has enough volume
        if (currentSyringeVolume >= dose) {
          currentSyringeVolume -= dose;
          injectionsInCurrentSyringe++;
        } else {
          // Save current syringe info
          schedule.push({
            syringeNumber,
            startInjection,
            endInjection: i - 1,
            totalVolume: SYRINGE_CAPACITY - currentSyringeVolume,
            injectionsCount: injectionsInCurrentSyringe,
            needNewSyringe: true,
          });
          
          // Start new syringe
          syringeNumber++;
          startInjection = i;
          currentSyringeVolume = SYRINGE_CAPACITY - dose;
          injectionsInCurrentSyringe = 1;
        }
      }
      
      // Add last syringe
      if (injectionsInCurrentSyringe > 0) {
        schedule.push({
          syringeNumber,
          startInjection,
          endInjection: totalPlannedInjections,
          totalVolume: SYRINGE_CAPACITY - currentSyringeVolume,
          injectionsCount: injectionsInCurrentSyringe,
          needNewSyringe: false,
        });
      }
      
      return schedule;
    };

    // Calculate how many shots of 0.25 and 0.5 are needed for each dose
    const calculateDoseBreakdown = (dose: number, remainingVolume: number): DoseBreakdown => {
      let shots025 = 0;
      let shots05 = 0;

      // Используем жадный алгоритм: сначала максимум 0.5, потом 0.25
      let remaining = dose;
      shots05 = Math.floor(remaining / 0.5);
      remaining = Math.round((remaining - shots05 * 0.5) * 100) / 100; // избегаем ошибок округления
      
      if (remaining > 0) {
        shots025 = Math.round(remaining / 0.25);
      }

      const totalShots = shots025 + shots05;
      const volumePerDose = dose; // каждая доза требует определенный объем
      const remainingInjectionsForThisDose = Math.floor(remainingVolume / volumePerDose);

      return {
        dose,
        shots025,
        shots05,
        totalShots,
        remainingInjectionsForThisDose,
      };
    };

    // Calculate current syringe status
    const calculateCurrentSyringeStatus = (): CurrentSyringeInfo | null => {
      if (totalInjections === 0) return null;

      let usedVolume = 0;
      let syringeNumber = 1;

      // Calculate which syringe we're on and how much volume has been used
      for (let i = 1; i <= totalInjections; i++) {
        let dose = MAINTENANCE_DOSE;
        let accumulatedInjections = 0;
        for (const scheme of TITRATION_SCHEME) {
          if (i <= accumulatedInjections + scheme.injections) {
            dose = scheme.dose;
            break;
          }
          accumulatedInjections += scheme.injections;
        }

        if (usedVolume + dose > SYRINGE_CAPACITY) {
          // Start new syringe
          syringeNumber++;
          usedVolume = dose;
        } else {
          usedVolume += dose;
        }
      }

      const remainingVolume = SYRINGE_CAPACITY - usedVolume;

      // Calculate how many more injections can be done with remaining volume
      let injectionsRemaining = 0;
      let tempVolume = remainingVolume;
      let tempInjectionCount = totalInjections;

      while (tempVolume > 0) {
        tempInjectionCount++;
        let dose = MAINTENANCE_DOSE;
        let accumulatedInjections = 0;
        for (const scheme of TITRATION_SCHEME) {
          if (tempInjectionCount <= accumulatedInjections + scheme.injections) {
            dose = scheme.dose;
            break;
          }
          accumulatedInjections += scheme.injections;
        }

        if (tempVolume >= dose) {
          tempVolume -= dose;
          injectionsRemaining++;
        } else {
          break;
        }

        // Prevent infinite loop
        if (tempInjectionCount > 100) break;
      }

      // Calculate date when new syringe will be needed
      let dateToReplaceBy: Date | null = null;
      if (injections.length > 0 && injectionsRemaining > 0) {
        const lastInjection = injections[injections.length - 1];
        const lastDate = new Date(lastInjection.date);
        dateToReplaceBy = new Date(lastDate);
        dateToReplaceBy.setDate(lastDate.getDate() + injectionsRemaining * 7);
      }

      return {
        remainingVolume,
        dateToReplaceBy,
        injectionsRemaining,
        syringeNumber,
      };
    };

    const currentSyringeInfo = calculateCurrentSyringeStatus();
    
    // Calculate dose breakdowns for all unique doses in the scheme
    const uniqueDoses = Array.from(new Set(TITRATION_SCHEME.map(s => s.dose)));
    const doseBreakdowns = uniqueDoses.map(dose => 
      calculateDoseBreakdown(dose, currentSyringeInfo?.remainingVolume || SYRINGE_CAPACITY)
    );

    return {
      steps,
      currentDose,
      totalInjections,
      futureSchedule,
      syringeCalculations: [
        calculateSyringeUsage(0.25),
        calculateSyringeUsage(0.5),
        calculateSyringeUsage(1.0),
      ],
      syringeSchedule025: calculateSyringeSchedule(0.25),
      syringeSchedule05: calculateSyringeSchedule(0.5),
      currentSyringeInfo,
      doseBreakdowns,
    };
  }, [injections]);

  return titrationData;
}
