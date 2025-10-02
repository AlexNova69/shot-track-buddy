import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import { useDataExport } from "@/hooks/useDataExport";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export function DataExporter() {
  const { language } = useLanguage();
  const t = translations[language];
  const { exportToJSON, exportToCSV } = useDataExport();

  const handleExportJSON = () => {
    try {
      exportToJSON();
      toast({
        title: t.dataExported,
        description: t.jsonSaved,
      });
    } catch (error) {
      toast({
        title: t.exportError,
        description: t.exportFailed,
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = (dataType: "injections" | "weights" | "sideEffects") => {
    try {
      exportToCSV(dataType);
      toast({
        title: t.dataExported,
        description: t.csvSaved,
      });
    } catch (error) {
      toast({
        title: t.exportError,
        description: t.exportFailed,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-medical-info" />
          {t.exportBackup}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">{t.fullExport}</h4>
          <Button onClick={handleExportJSON} className="w-full flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            {t.exportAll}
          </Button>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">{t.exportByCategory}</h4>
          <div className="space-y-2">
            <Button 
              onClick={() => handleExportCSV("injections")} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.injectionsData}
            </Button>
            <Button 
              onClick={() => handleExportCSV("weights")} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.weightData}
            </Button>
            <Button 
              onClick={() => handleExportCSV("sideEffects")} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.sideEffectsData}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            {t.backupTip}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}