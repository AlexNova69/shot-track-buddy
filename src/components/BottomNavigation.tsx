import { Home, History, BarChart3, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Главная" },
    { path: "/history", icon: History, label: "История" },
    { path: "/charts", icon: BarChart3, label: "Графики" },
    { path: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2">
      <div className="flex justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px]",
                isActive
                  ? "text-medical-primary bg-medical-light"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}