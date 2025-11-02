import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";
import bodyDiagram from "@/assets/body-diagram.png";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

interface InjectionSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InjectionSiteDialog({ open, onOpenChange }: InjectionSiteDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  const injectionSites = [
    { id: "stomach-left", name: t.stomachLeft, x: 35, y: 45 },
    { id: "stomach-right", name: t.stomachRight, x: 65, y: 45 },
    { id: "arm-left", name: t.armLeft, x: 25, y: 30 },
    { id: "arm-right", name: t.armRight, x: 75, y: 30 },
  ];
  
  const [injectionSiteRecords, setInjectionSiteRecords] = useLocalStorage("injectionSites", []);
  const [selectedSite, setSelectedSite] = useState("");

  const getLastUsedDate = (siteId: string) => {
    const siteRecords = injectionSiteRecords.filter((record: any) => record.site === siteId);
    if (siteRecords.length === 0) return null;
    const lastRecord = siteRecords[siteRecords.length - 1];
    return new Date(lastRecord.date);
  };

  const handleSiteClick = (siteId: string, siteName: string) => {
    setSelectedSite(siteId);
    
    const lastUsed = getLastUsedDate(siteId);
    const daysSince = lastUsed ? Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    let message = `${t.selected}: ${siteName}`;
    if (daysSince !== null) {
      message += `\n${t.lastUsed}: ${daysSince} ${t.daysAgo}`;
    }
    
    toast({
      title: t.injectionSiteTitle,
      description: message,
    });
  };

  const handleSave = () => {
    if (!selectedSite) {
      toast({
        title: t.error,
        description: t.selectSiteError,
        variant: "destructive",
      });
      return;
    }

    const selectedSiteData = injectionSites.find(site => site.id === selectedSite);
    
    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      site: selectedSite,
      siteName: selectedSiteData?.name || "",
    };

    setInjectionSiteRecords([...injectionSiteRecords, newRecord]);
    
    toast({
      title: t.siteLogged,
      description: `${selectedSiteData?.name} ${t.markedForNext}`,
    });
    
    setSelectedSite("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.selectInjectionSiteTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={bodyDiagram} 
              alt={t.bodyDiagramAlt}
              className="w-full h-auto max-h-96 mx-auto"
            />
            
            {injectionSites.map((site) => {
              const lastUsed = getLastUsedDate(site.id);
              const daysSince = lastUsed ? Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)) : null;
              const isSelected = selectedSite === site.id;
              
              return (
                <button
                  key={site.id}
                  onClick={() => handleSiteClick(site.id, site.name)}
                  className={`absolute w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    isSelected 
                      ? "bg-medical-primary border-medical-primary shadow-lg" 
                      : daysSince !== null && daysSince < 3
                        ? "bg-medical-warning border-medical-warning"
                        : "bg-medical-success border-medical-success hover:bg-medical-success/80"
                  }`}
                  style={{
                    left: `${site.x}%`,
                    top: `${site.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="sr-only">{site.name}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">{t.injectionSitesLabel}</h4>
            <div className="grid grid-cols-2 gap-2">
              {injectionSites.map((site) => {
                const lastUsed = getLastUsedDate(site.id);
                const daysSince = lastUsed ? Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)) : null;
                const isSelected = selectedSite === site.id;
                
                return (
                  <Button
                    key={site.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSiteClick(site.id, site.name)}
                    className="justify-start h-auto p-2"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">{site.name}</div>
                      {daysSince !== null && (
                        <div className="text-xs opacity-70">
                          {daysSince} {t.daysAgo}
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-medical-success"></div>
              <span>{t.available}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-medical-warning"></div>
              <span>{t.recentlyUsed}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-medical-primary"></div>
              <span>{t.selected}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1" disabled={!selectedSite}>
              {t.save}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}