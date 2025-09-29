import { ReactNode } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <h1 className="text-xl font-semibold text-medical-primary">Трекер инъекций</h1>
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