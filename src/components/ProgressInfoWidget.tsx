import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingDown, Clock } from "lucide-react";
import { differenceInDays, format, addDays } from "date-fns";
import { ru } from "date-fns/locale";

export function ProgressInfoWidget() {
  const { language } = useLanguage();
  const t = translations[language];
  const [injections] = useLocalStorage("injections", []);
  const [weights] = useLocalStorage("weights", []);
  
  const locale = language === "ru" ? ru : undefined;

  // Рассчитываем данные
  const calculateStats = () => {
    if (injections.length === 0) {
      return {
        daysSinceFirst: 0,
        weightLost: 0,
        nextInjectionDate: null,
      };
    }

    // Сортируем инъекции по дате
    const sortedInjections = [...injections].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstInjection = sortedInjections[0];
    const lastInjection = sortedInjections[sortedInjections.length - 1];
    
    // Дни с первой инъекции
    const daysSinceFirst = differenceInDays(new Date(), new Date(firstInjection.date));
    
    // Потерянный вес
    let weightLost = 0;
    if (weights.length >= 2) {
      const sortedWeights = [...weights].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstWeight = sortedWeights[0].weight;
      const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
      weightLost = firstWeight - lastWeight;
    }
    
    // Следующая инъекция (предполагаем еженедельно)
    const nextInjectionDate = addDays(new Date(lastInjection.date), 7);
    
    return {
      daysSinceFirst,
      weightLost: Math.max(0, weightLost),
      nextInjectionDate,
    };
  };

  const stats = calculateStats();

  if (injections.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-medical-primary/10 to-medical-success/10 border-medical-primary/20">
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Дни с начала */}
          <div className="space-y-1">
            <div className="flex justify-center">
              <Clock className="w-4 h-4 text-medical-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">
              {stats.daysSinceFirst}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.daysSinceStart}
            </div>
          </div>

          {/* Потерянный вес */}
          <div className="space-y-1 border-l border-r border-border/50">
            <div className="flex justify-center">
              <TrendingDown className="w-4 h-4 text-medical-success" />
            </div>
            <div className="text-lg font-bold text-foreground">
              {stats.weightLost.toFixed(1)} {language === "ru" ? "кг" : "kg"}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.totalWeightLost}
            </div>
          </div>

          {/* Следующая инъекция */}
          <div className="space-y-1">
            <div className="flex justify-center">
              <Calendar className="w-4 h-4 text-medical-info" />
            </div>
            <div className="text-lg font-bold text-foreground">
              {stats.nextInjectionDate ? format(stats.nextInjectionDate, "d MMM", { locale }) : "-"}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.nextInjection}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
