import { ReactNode } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import appLogo from "@/assets/app-logo.png";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { translations } from "@/lib/translations";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [profile] = useLocalStorage("profile", { name: "", height: "" });
  const [weights] = useLocalStorage("weights", []);

  const getCurrentBMI = () => {
    if (weights.length === 0 || !profile.height) return null;
    
    const sortedWeights = [...weights].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestWeight = parseFloat(sortedWeights[0].weight);
    const heightNum = parseInt(profile.height);
    
    if (!latestWeight || !heightNum) return null;
    
    const heightInMeters = heightNum / 100;
    const bmi = latestWeight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile.name || t.user;
    
    if (hour >= 6 && hour < 12) {
      return `${t.goodMorning}, ${name}`;
    } else if (hour >= 12 && hour < 18) {
      return `${t.goodAfternoon}, ${name}`;
    } else if (hour >= 18 && hour < 23) {
      return `${t.goodEvening}, ${name}`;
    } else {
      return `${t.goodNight}, ${name}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 pt-6 pb-6">
        <div className="flex items-end justify-between h-full min-h-[84px]">
          <div className="flex items-end gap-3">
            <img src={appLogo} alt="Logo" className="w-8 h-8 mb-0.5" />
            <h1 className="text-xl font-semibold text-medical-primary leading-none">{t.appName}</h1>
          </div>
          <div className="text-right">
            {getCurrentBMI() && (
              <p className="text-xs text-muted-foreground">BMI: <span className="font-semibold text-medical-primary">{getCurrentBMI()}</span></p>
            )}
            <p className="text-sm text-muted-foreground leading-none mt-1">{getGreeting()}</p>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 pb-20 overflow-auto">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}