import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import { useDataExport } from "@/hooks/useDataExport";
import { toast } from "@/hooks/use-toast";

export function DataExporter() {
  const { exportToJSON, exportToCSV } = useDataExport();

  const handleExportJSON = () => {
    try {
      exportToJSON();
      toast({
        title: "Данные экспортированы",
        description: "Файл JSON сохранен на устройство",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = (dataType: "injections" | "weights" | "sideEffects") => {
    try {
      exportToCSV(dataType);
      toast({
        title: "Данные экспортированы",
        description: "CSV файл сохранен на устройство",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-medical-info" />
          Экспорт и резервное копирование
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Полный экспорт</h4>
          <Button onClick={handleExportJSON} className="w-full flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Экспортировать все данные (JSON)
          </Button>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Экспорт по категориям (CSV)</h4>
          <div className="space-y-2">
            <Button 
              onClick={() => handleExportCSV("injections")} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Инъекции
            </Button>
            <Button 
              onClick={() => handleExportCSV("weights")} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Данные о весе
            </Button>
            <Button 
              onClick={() => handleExportCSV("sideEffects")} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Побочные эффекты
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            💡 Регулярно создавайте резервные копии данных для их сохранности
          </p>
        </div>
      </CardContent>
    </Card>
  );
}