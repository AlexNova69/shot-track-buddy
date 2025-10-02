import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export function ThemeSelector() {
  const { language } = useLanguage();
  const t = translations[language];
  const { theme, setTheme } = useTheme();
  const [customColors, setCustomColors] = useLocalStorage("customColors", {
    primary: "#0066cc",
    accent: "#00b894",
    warning: "#fdcb6e",
  });

  const themes = [
    { value: "light", label: t.light, icon: Sun },
    { value: "dark", label: t.dark, icon: Moon },
    { value: "system", label: t.system, icon: Monitor },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-medical-primary" />
          {t.themePersonalization}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">{t.appTheme}</h4>
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
          <h4 className="font-medium mb-3">{t.colorScheme}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.primaryColor}</span>
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                className="w-8 h-8 rounded border"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.accentColor}</span>
              <input
                type="color"
                value={customColors.accent}
                onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                className="w-8 h-8 rounded border"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.warningColor}</span>
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
          <h4 className="font-medium mb-2">{t.preview}</h4>
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