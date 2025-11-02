import { Card, CardContent } from "@/components/ui/card";
import { Syringe, Weight, FileText } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export function StatsBar() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [injections] = useLocalStorage("injections", []);
  const [weights] = useLocalStorage("weights", []);
  const [sideEffects] = useLocalStorage("sideEffects", []);

  const totalInjections = injections.length;
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const totalRecords = injections.length + weights.length + sideEffects.length;

  const stats = [
    {
      icon: Syringe,
      label: t.total,
      value: totalInjections,
      color: "text-medical-primary",
    },
    {
      icon: Weight,
      label: "кг",
      value: latestWeight,
      color: "text-medical-success",
    },
    {
      icon: FileText,
      label: t.records,
      value: totalRecords,
      color: "text-medical-info",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}