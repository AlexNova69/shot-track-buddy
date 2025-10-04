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
  const [profile] = useLocalStorage("profile", { name: "" });

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
      <header className="bg-card border-b border-border px-4 py-12">
        <div className="flex items-end justify-between h-full">
          <div className="flex items-center gap-3">
            <img src={appLogo} alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-medical-primary">{t.appName}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
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