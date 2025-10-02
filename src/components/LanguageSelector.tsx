import { useLanguage } from "@/hooks/useLanguage";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { translations } from "@/lib/translations";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{t.language}</h3>
      </div>
      <RadioGroup value={language} onValueChange={(value) => setLanguage(value as "ru" | "en")}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ru" id="ru" />
          <Label htmlFor="ru">Русский</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="en" id="en" />
          <Label htmlFor="en">English</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
