import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Syringe, Weight, AlertTriangle, Target } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { InjectionDialog } from "@/components/dialogs/InjectionDialog";
import { WeightDialog } from "@/components/dialogs/WeightDialog";
import { SideEffectDialog } from "@/components/dialogs/SideEffectDialog";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function History() {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? "ru-RU" : "en-US";
  
  const [injections, setInjections] = useLocalStorage("injections", []);
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [sideEffects, setSideEffects] = useLocalStorage("sideEffects", []);
  const [injectionSites, setInjectionSites] = useLocalStorage("injectionSites", []);

  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [dialogType, setDialogType] = useState<string>("");
  const [deleteRecord, setDeleteRecord] = useState<any>(null);

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

  const handleEdit = (record: any) => {
    if (record.type === "site") {
      toast({
        title: t.info || "Информация",
        description: "Места уколов редактируются автоматически при редактировании инъекций",
      });
      return;
    }
    setEditingRecord(record);
    setDialogType(record.type);
  };

  const handleDelete = (record: any) => {
    setDeleteRecord(record);
  };

  const confirmDelete = () => {
    if (!deleteRecord) return;

    switch (deleteRecord.type) {
      case "injection":
        setInjections(injections.filter((item: any) => item.id !== deleteRecord.id));
        break;
      case "weight":
        setWeights(weights.filter((item: any) => item.id !== deleteRecord.id));
        break;
      case "sideEffect":
        setSideEffects(sideEffects.filter((item: any) => item.id !== deleteRecord.id));
        break;
      case "site":
        setInjectionSites(injectionSites.filter((item: any) => item.id !== deleteRecord.id));
        break;
    }

    toast({
      title: t.recordDeleted || "Запись удалена",
      description: t.recordDeletedSuccess || "Запись успешно удалена",
    });

    setDeleteRecord(null);
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDelete(record)}
                      >
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

      <InjectionDialog
        open={dialogType === "injection"}
        onOpenChange={(open) => {
          if (!open) {
            setDialogType("");
            setEditingRecord(null);
          }
        }}
        editRecord={editingRecord}
      />

      <WeightDialog
        open={dialogType === "weight"}
        onOpenChange={(open) => {
          if (!open) {
            setDialogType("");
            setEditingRecord(null);
          }
        }}
        editRecord={editingRecord}
      />

      <SideEffectDialog
        open={dialogType === "sideEffect"}
        onOpenChange={(open) => {
          if (!open) {
            setDialogType("");
            setEditingRecord(null);
          }
        }}
        editRecord={editingRecord}
      />

      <AlertDialog open={!!deleteRecord} onOpenChange={(open) => !open && setDeleteRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmDelete || "Подтвердите удаление"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmDeleteDesc || "Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t.delete || "Удалить"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}