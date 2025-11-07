import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Syringe, TrendingUp, AlertTriangle } from "lucide-react";
import { useTitration } from "@/hooks/useTitration";
import { useSyringeManagement } from "@/hooks/useSyringeManagement";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TitrationWidget() {
  const { 
    steps, 
    currentDose, 
    totalInjections, 
    futureSchedule, 
    syringeSchedule025, 
    syringeSchedule05,
    currentSyringeInfo,
    doseBreakdowns 
  } = useTitration();
  const { calculateSyringeStatus } = useSyringeManagement();
  const syringeStatus = calculateSyringeStatus();
  const { language } = useLanguage();
  const t = (key: string) => (translations[language] as any)[key];
  const locale = language === "ru" ? ru : enUS;

  // Calculate next injection details
  const nextInjection = futureSchedule[0];
  
  // Calculate how to make the next injection with current syringe
  const calculateNextInjectionBreakdown = () => {
    if (!nextInjection || !syringeStatus.currentSyringe) return null;
    
    const dose = nextInjection.dose;
    const syringeType = syringeStatus.currentSyringe.type;
    const concentration = 1.34; // мг/мл
    const volumeNeeded = dose / concentration;
    
    // Calculate shots breakdown based on syringe type
    let shots = [];
    if (syringeType === '0.25-0.5') {
      // Prefer 0.5ml shots, then 0.25ml
      let remaining = dose;
      const shots05 = Math.floor(remaining / 0.5);
      remaining = Math.round((remaining - shots05 * 0.5) * 100) / 100;
      const shots025 = Math.round(remaining / 0.25);
      
      if (shots05 > 0) shots.push({ amount: 0.5, count: shots05 });
      if (shots025 > 0) shots.push({ amount: 0.25, count: shots025 });
    } else {
      // Type 1.0 - single shot
      shots.push({ amount: 1.0, count: Math.ceil(dose / 1.0) });
    }
    
    const remainingAfter = Math.max(0, syringeStatus.remainingVolume - volumeNeeded);
    const enoughForNext = syringeStatus.remainingVolume >= volumeNeeded;
    
    return {
      dose,
      shots,
      volumeNeeded,
      remainingAfter,
      enoughForNext
    };
  };
  
  const nextInjectionBreakdown = calculateNextInjectionBreakdown();

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
            <div className="space-y-6">
              {/* Next Injection Info */}
              {nextInjectionBreakdown && syringeStatus.currentSyringe && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-primary" />
                    {t("nextInjectionInfo")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">{t("dose")}:</span>
                      <Badge variant="default">{nextInjectionBreakdown.dose} {t("mg")}</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">{t("howToInject")}:</p>
                      <div className="space-y-1 ml-4">
                        {nextInjectionBreakdown.shots.map((shot, idx) => (
                          <div key={idx} className="text-sm">
                            • {shot.count} {t("shot")} × {shot.amount} {t("mg")}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("currentRemaining")}:</span>
                        <span className="font-medium">{syringeStatus.remainingVolume.toFixed(2)} {t("ml")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("afterInjection")}:</span>
                        <span className="font-medium">{nextInjectionBreakdown.remainingAfter.toFixed(2)} {t("ml")}</span>
                      </div>
                    </div>
                    
                    {!nextInjectionBreakdown.enoughForNext && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t("warning")}</AlertTitle>
                        <AlertDescription>
                          {t("notEnoughInSyringe")}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              )}

              {/* Current Syringe Status from Profile */}
              {syringeStatus.currentSyringe && (
                <Card className="p-4 bg-secondary/5 border-secondary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-secondary" />
                    {t("syringeFromProfile")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("syringeType")}:</span>
                      <Badge variant="secondary">
                        {syringeStatus.currentSyringe.type === '0.25-0.5' ? '0.25 / 0.5 мг' : '1.0 мг'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("capacity")}:</span>
                      <span className="font-medium">{syringeStatus.currentSyringe.capacity} {t("ml")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("usedVolume")}:</span>
                      <span className="font-medium">{syringeStatus.usedVolume.toFixed(2)} {t("ml")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("remainingVolume")}:</span>
                      <span className="font-medium">{syringeStatus.remainingVolume.toFixed(2)} {t("ml")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("injectionsRemaining")}:</span>
                      <span className="font-medium">{syringeStatus.remainingInjections}</span>
                    </div>
                    {syringeStatus.dateToReplace && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">{t("buyNewSyringeBy")}:</span>
                        <span className="font-bold text-primary">
                          {format(syringeStatus.dateToReplace, "d MMMM yyyy", { locale })}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
              
              {!syringeStatus.currentSyringe && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("noActiveSyringe")}</AlertTitle>
                  <AlertDescription>
                    {t("addSyringeInProfile")}
                  </AlertDescription>
                </Alert>
              )}

              {/* Dose Breakdown */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Syringe className="h-4 w-4" />
                  {t("doseBreakdown")}
                </h3>
                <div className="space-y-2">
                  {doseBreakdowns.map((breakdown) => (
                    <Card key={breakdown.dose} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t("dose")}: {breakdown.dose} {t("mg")}</span>
                          <Badge variant="secondary">{breakdown.totalShots} {t("shots")}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {breakdown.shots05 > 0 && (
                            <div>• {breakdown.shots05} × 0.5 {t("mg")}</div>
                          )}
                          {breakdown.shots025 > 0 && (
                            <div>• {breakdown.shots025} × 0.25 {t("mg")}</div>
                          )}
                          {currentSyringeInfo && (
                            <div className="pt-1 border-t mt-2">
                              {t("canDoThisDose")}: <span className="font-medium">{breakdown.remainingInjectionsForThisDose} {t("times")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Syringe className="h-4 w-4" />
                  {t("syringeSchedule025")}
                </h3>
                <div className="space-y-2">
                  {syringeSchedule025.map((syringe) => (
                    <Card key={syringe.syringeNumber} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {t("syringeNumber")} {syringe.syringeNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("injections")} {syringe.startInjection} - {syringe.endInjection}
                          </p>
                          <p className="text-sm">
                            {t("injectionsCount")}: {syringe.injectionsCount}
                          </p>
                          <p className="text-sm">
                            {t("volumeUsed")}: {syringe.totalVolume.toFixed(2)} {t("ml")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {syringe.needNewSyringe && (
                            <Badge variant="destructive">
                              {t("buyNewSyringe")}
                            </Badge>
                          )}
                          {totalInjections >= syringe.startInjection && totalInjections <= syringe.endInjection && (
                            <Badge variant="default">
                              {t("currentSyringe")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Syringe className="h-4 w-4" />
                  {t("syringeSchedule05")}
                </h3>
                <div className="space-y-2">
                  {syringeSchedule05.map((syringe) => (
                    <Card key={syringe.syringeNumber} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {t("syringeNumber")} {syringe.syringeNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("injections")} {syringe.startInjection} - {syringe.endInjection}
                          </p>
                          <p className="text-sm">
                            {t("injectionsCount")}: {syringe.injectionsCount}
                          </p>
                          <p className="text-sm">
                            {t("volumeUsed")}: {syringe.totalVolume.toFixed(2)} {t("ml")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {syringe.needNewSyringe && (
                            <Badge variant="destructive">
                              {t("buyNewSyringe")}
                            </Badge>
                          )}
                          {totalInjections >= syringe.startInjection && totalInjections <= syringe.endInjection && (
                            <Badge variant="default">
                              {t("currentSyringe")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
