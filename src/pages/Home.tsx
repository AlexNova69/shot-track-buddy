import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Syringe, Weight, AlertTriangle, Target, TrendingUp, Ruler } from "lucide-react";
import { StatsBar } from "@/components/StatsBar";
import { WidgetCard } from "@/components/WidgetCard";
import { MiniChart } from "@/components/MiniChart";
import { RecentRecords } from "@/components/RecentRecords";
import { InjectionDialog } from "@/components/dialogs/InjectionDialog";
import { WeightDialog } from "@/components/dialogs/WeightDialog";
import { SideEffectDialog } from "@/components/dialogs/SideEffectDialog";
import { InjectionSiteDialog } from "@/components/dialogs/InjectionSiteDialog";
import { MeasurementsDialog } from "@/components/dialogs/MeasurementsDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [injectionDialogOpen, setInjectionDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [sideEffectDialogOpen, setSideEffectDialogOpen] = useState(false);
  const [injectionSiteDialogOpen, setInjectionSiteDialogOpen] = useState(false);
  const [measurementsDialogOpen, setMeasurementsDialogOpen] = useState(false);

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

      {/* Measurements widget - full width below other widgets */}
      <Card 
        className="cursor-pointer transition-all hover:shadow-lg active:scale-95" 
        onClick={() => setMeasurementsDialogOpen(true)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <Ruler className="w-8 h-8 text-medical-info flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{t.bodyMeasurements}</h3>
            <p className="text-sm text-muted-foreground">{t.trackMeasurements}</p>
          </div>
        </CardContent>
      </Card>

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
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/charts')}>
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
      <MeasurementsDialog open={measurementsDialogOpen} onOpenChange={setMeasurementsDialogOpen} />
    </div>
  );
}