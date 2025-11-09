import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import { useDataExport } from "@/hooks/useDataExport";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { useRef } from "react";
import { Share } from "lucide-react";

export function DataExporter() {
  const { language } = useLanguage();
  const t = translations[language];
  const { exportToJSON, exportToCSV, importFromJSON, shareJSON, copyJSONToClipboard } = useDataExport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    try {
      await exportToJSON();
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

  const handleExportCSV = async (dataType: "injections" | "weights" | "sideEffects") => {
    try {
      await exportToCSV(dataType);
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleShareJSON = async () => {
    try {
      const res = await shareJSON();
      const map = {
        'native-share': { title: 'Файл передан', desc: 'Файл передан через системное окно «Поделиться»' },
        'share-files': { title: 'Файл передан', desc: 'Файл передан через системное окно «Поделиться»' },
        'download': { title: 'Файл сохранён', desc: 'JSON-файл скачан в загрузки' },
        'open': { title: 'Файл открыт', desc: 'JSON-файл открыт в новой вкладке — используйте меню для сохранения/отправки' },
        'clipboard': { title: 'Данные скопированы', desc: 'JSON скопирован в буфер — вставьте в заметки/чат' },
        'copy-textarea': { title: 'Данные скопированы', desc: 'JSON скопирован — вставьте в заметки/чат' },
      } as const;
      const msg = map[res?.method as keyof typeof map] ?? { title: 'Готово', desc: 'Данные подготовлены' };
      toast({ title: msg.title, description: msg.desc });
    } catch (error) {
      toast({
        title: "Ошибка передачи",
        description: error instanceof Error ? error.message : "Не удалось поделиться данными",
        variant: "destructive",
      });
    }
  };

  const handleCopyJSON = async () => {
    try {
      const res = await copyJSONToClipboard();
      const map = {
        'clipboard': { title: 'Данные скопированы', desc: 'JSON в буфере — вставьте в заметки/чат' },
        'copy-textarea': { title: 'Данные скопированы', desc: 'JSON скопирован — вставьте в заметки/чат' },
      } as const;
      const msg = map[res?.method as keyof typeof map] ?? { title: 'Готово', desc: 'Данные скопированы' };
      toast({ title: msg.title, description: msg.desc });
    } catch (error) {
      toast({
        title: "Ошибка копирования",
        description: error instanceof Error ? error.message : "Не удалось скопировать данные",
        variant: "destructive",
      });
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importFromJSON(file);
      toast({
        title: t.importSuccess || "Данные импортированы",
        description: t.importSuccessDesc || "Все данные успешно загружены из файла",
      });
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: t.importError || "Ошибка импорта",
        description: t.importErrorDesc || "Не удалось импортировать данные. Проверьте формат файла.",
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
          <div className="space-y-2">
            <Button onClick={handleExportJSON} className="w-full flex items-center gap-2">
              <Download className="w-4 h-4" />
              {t.exportAll}
            </Button>
            <Button onClick={handleShareJSON} variant="secondary" className="w-full flex items-center gap-2">
              <Share className="w-4 h-4" />
              Поделиться (системное меню)
            </Button>
            <Button onClick={handleCopyJSON} variant="outline" className="w-full flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              Копировать JSON
            </Button>
            <Button onClick={handleImportClick} variant="outline" className="w-full flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t.importData || "Импортировать данные"}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
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