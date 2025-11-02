import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Syringe, Weight, AlertTriangle, Target } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function History() {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? "ru-RU" : "en-US";
  
  const [injections] = useLocalStorage("injections", []);
  const [weights] = useLocalStorage("weights", []);
  const [sideEffects] = useLocalStorage("sideEffects", []);
  const [injectionSites] = useLocalStorage("injectionSites", []);

  const allRecords = [
    ...injections.map((item: any) => ({ ...item, type: "injection", icon: Syringe })),
    ...weights.map((item: any) => ({ ...item, type: "weight", icon: Weight })),
    ...sideEffects.map((item: any) => ({ ...item, type: "sideEffect", icon: AlertTriangle })),
    ...injectionSites.map((item: any) => ({ ...item, type: "site", icon: Target })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getRecordContent = (record: any) => {
    switch (record.type) {
      case "injection":
        return `${t.doseField}: ${record.dose}${language === "ru" ? "мг" : "mg"}, ${t.siteField}: ${record.site}`;
      case "weight":
        return `${record.weight}${language === "ru" ? "кг" : "kg"}`;
      case "sideEffect":
        return record.description;
      case "site":
        return `${t.siteField}: ${record.site}`;
      default:
        return "";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "injection":
        return "bg-medical-primary";
      case "weight":
        return "bg-medical-success";
      case "sideEffect":
        return "bg-medical-warning";
      case "site":
        return "bg-medical-info";
      default:
        return "bg-muted";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "injection":
        return t.injection;
      case "weight":
        return t.weightRecord;
      case "sideEffect":
        return t.sideEffectRecord;
      case "site":
        return t.injectionSiteRecord;
      default:
        return "";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">{t.recordsHistory}</h2>
      
      {allRecords.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Syringe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t.noRecordsYet}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allRecords.map((record: any, index: number) => {
            const Icon = record.icon;
            return (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(record.type)} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {getTypeName(record.type)}
                        </Badge>
                        <CardTitle className="text-sm">
                          {new Date(record.date).toLocaleDateString(locale)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getRecordContent(record)}
                        </p>
                        {record.comment && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {record.comment}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}