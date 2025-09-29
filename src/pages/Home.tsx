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

export default function Home() {
  const [injectionDialogOpen, setInjectionDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [sideEffectDialogOpen, setSideEffectDialogOpen] = useState(false);
  const [injectionSiteDialogOpen, setInjectionSiteDialogOpen] = useState(false);

  const widgets = [
    {
      icon: Syringe,
      title: "Инъекции",
      description: "Добавить запись о уколе",
      color: "text-medical-primary",
      onClick: () => setInjectionDialogOpen(true),
    },
    {
      icon: Weight,
      title: "Вес",
      description: "Записать текущий вес",
      color: "text-medical-success",
      onClick: () => setWeightDialogOpen(true),
    },
    {
      icon: AlertTriangle,
      title: "Побочный эффект",
      description: "Отметить состояние",
      color: "text-medical-warning",
      onClick: () => setSideEffectDialogOpen(true),
    },
    {
      icon: Target,
      title: "Места инъекций",
      description: "Схема тела",
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
              Динамика веса
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniChart />
            <Button variant="outline" className="w-full mt-4">
              Посмотреть всё
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