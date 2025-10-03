import { ReactNode } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import appLogo from "@/assets/app-logo.png";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-semibold text-medical-primary">{t.appName}</h1>
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