import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [customColors, setCustomColors] = useLocalStorage("customColors", {
    primary: "#0066cc",
    accent: "#00b894",
    warning: "#fdcb6e",
  });

  const themes = [
    { value: "light", label: "Светлая", icon: Sun },
    { value: "dark", label: "Темная", icon: Moon },
    { value: "system", label: "Системная", icon: Monitor },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-medical-primary" />
          Тема и персонализация
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Тема приложения</h4>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "outline"}
                onClick={() => setTheme(value as any)}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Цветовая схема</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Основной цвет</span>
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                className="w-8 h-8 rounded border"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Акцентный цвет</span>
              <input
                type="color"
                value={customColors.accent}
                onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                className="w-8 h-8 rounded border"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Цвет предупреждений</span>
              <input
                type="color"
                value={customColors.warning}
                onChange={(e) => setCustomColors({ ...customColors, warning: e.target.value })}
                className="w-8 h-8 rounded border"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Предварительный просмотр</h4>
          <div className="p-4 border rounded-lg space-y-2">
            <div 
              className="h-4 rounded" 
              style={{ backgroundColor: customColors.primary }}
            />
            <div 
              className="h-4 rounded w-3/4" 
              style={{ backgroundColor: customColors.accent }}
            />
            <div 
              className="h-4 rounded w-1/2" 
              style={{ backgroundColor: customColors.warning }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}