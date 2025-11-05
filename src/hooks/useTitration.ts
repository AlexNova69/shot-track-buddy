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
    };
  }, [injections]);

  return titrationData;
}
