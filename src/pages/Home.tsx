import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Syringe, Weight, AlertTriangle, Target, TrendingUp } from "lucide-react";
import { StatsBar } from "@/components/StatsBar";
import { WidgetCard } from "@/components/WidgetCard";
import { MiniChart } from "@/components/MiniChart";
import { RecentRecords } from "@/components/RecentRecords";
import { InjectionDialog } from "@/components/dialogs/InjectionDialog";
import { WeightDialog } from "@/components/dialogs/WeightDialog";
import { SideEffectDialog } from "@/components/dialogs/SideEffectDialog";
import { InjectionSiteDialog } from "@/components/dialogs/InjectionSiteDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [injectionDialogOpen, setInjectionDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [sideEffectDialogOpen, setSideEffectDialogOpen] = useState(false);
  const [injectionSiteDialogOpen, setInjectionSiteDialogOpen] = useState(false);

  const widgets = [
    {
      icon: Syringe,
      title: t.injections,
      description: t.addInjection,
      color: "text-medical-primary",
      onClick: () => setInjectionDialogOpen(true),
    },
    {
      icon: Weight,
      title: t.weight,
      description: t.recordWeight,
      color: "text-medical-success",
      onClick: () => setWeightDialogOpen(true),
    },
    {
      icon: AlertTriangle,
      title: t.logSideEffect,
      description: t.markCondition,
      color: "text-medical-warning",
      onClick: () => setSideEffectDialogOpen(true),
    },
    {
      icon: Target,
      title: t.injectionSites,
      description: t.bodyDiagram,
      color: "text-medical-info",
      onClick: () => setInjectionSiteDialogOpen(true),
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <StatsBar />
      
      <div className="grid grid-cols-2 gap-4">
        {widgets.map((widget, index) => (
          <WidgetCard key={index} {...widget} />
        ))}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-medical-primary" />
              {t.weightDynamics}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniChart />
            <Button variant="outline" className="w-full mt-4">
              {t.viewAll}
            </Button>
          </CardContent>
        </Card>

        <RecentRecords />
      </div>

      <InjectionDialog open={injectionDialogOpen} onOpenChange={setInjectionDialogOpen} />
      <WeightDialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen} />
      <SideEffectDialog open={sideEffectDialogOpen} onOpenChange={setSideEffectDialogOpen} />
      <InjectionSiteDialog open={injectionSiteDialogOpen} onOpenChange={setInjectionSiteDialogOpen} />
    </div>
  );
}