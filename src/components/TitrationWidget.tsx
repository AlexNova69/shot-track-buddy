import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Syringe, TrendingUp } from "lucide-react";
import { useTitration } from "@/hooks/useTitration";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";

export function TitrationWidget() {
  const { steps, currentDose, totalInjections, futureSchedule, syringeCalculations } = useTitration();
  const { language } = useLanguage();
  const t: any = translations[language];
  const locale = language === "ru" ? ru : enUS;

  const totalInjectionsInScheme = steps.reduce((acc, step) => acc + step.injections, 0);
  const overallProgress = (totalInjections / totalInjectionsInScheme) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("titrationSchedule")}
        </CardTitle>
        <CardDescription>
          {t("currentDose")}: <span className="font-bold text-primary">{currentDose} {t("mg")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">{t("schedule")}</TabsTrigger>
            <TabsTrigger value="future">{t("futureInjections")}</TabsTrigger>
            <TabsTrigger value="syringe">{t("syringeCalc")}</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("overallProgress")}</span>
                <span className="font-medium">{totalInjections}/{totalInjectionsInScheme} {t("injections")}</span>
              </div>
              <Progress value={Math.min(overallProgress, 100)} className="h-2" />
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={step.isActive ? "default" : step.completed === step.injections ? "secondary" : "outline"}>
                        {step.dose} {t("mg")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {t("weeks")} {step.week}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {step.completed}/{step.injections}
                    </span>
                  </div>
                  <Progress 
                    value={(step.completed / step.injections) * 100} 
                    className="h-1.5"
                  />
                  {step.isActive && step.remaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("remaining")}: {step.remaining} {t("injections")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="future" className="mt-4">
            {futureSchedule.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {futureSchedule.map((injection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {t("injection")} #{injection.injectionNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(injection.date, "d MMMM yyyy", { locale })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {injection.dose} {t("mg")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("noInjectionsYet")}
              </p>
            )}
          </TabsContent>

          <TabsContent value="syringe" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {t("syringeCapacity")}: 3 {t("ml")}
              </p>
              {syringeCalculations.map((calc, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Syringe className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">
                      {t("syringeDivision")}: {calc.division} {t("ml")}
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("dosesPerSyringe")}:</span>
                      <span className="font-medium">{calc.dosesPerSyringe.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("injectionsRemaining")}:</span>
                      <span className="font-medium">{calc.injectionsNeeded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("syringesNeeded")}:</span>
                      <span className="font-bold text-primary">{calc.syringesNeeded}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
