import { ReactNode } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import appLogo from "@/assets/app-logo.png";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-semibold text-medical-primary">Трекер инъекций</h1>
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