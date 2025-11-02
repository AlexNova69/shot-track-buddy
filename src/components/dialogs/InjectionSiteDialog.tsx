import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";
import bodyDiagram from "@/assets/body-diagram.png";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  const [injectionSiteRecords] = useLocalStorage("injectionSites", []);
  const [preferredSites, setPreferredSites] = useLocalStorage("preferredSites", []);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [nextSuggestedSite, setNextSuggestedSite] = useState<string>("");
  const [lastUsedSite, setLastUsedSite] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedSites(preferredSites.length > 0 ? preferredSites : []);
      
      // Определяем последнее использованное место
      if (injectionSiteRecords.length > 0) {
        const lastRecord = injectionSiteRecords[injectionSiteRecords.length - 1];
        setLastUsedSite(lastRecord.site);
        
        // Определяем следующее рекомендуемое место
        const availableSites = preferredSites.length > 0 
          ? injectionSites.filter(s => preferredSites.includes(s.id))
          : injectionSites;
        
        const otherSites = availableSites.filter(s => s.id !== lastRecord.site);
        
        if (otherSites.length > 0) {
          const sitesWithDates = otherSites.map(s => {
            const siteRecords = injectionSiteRecords.filter((r: any) => r.site === s.id);
            const lastUse = siteRecords.length > 0 
              ? new Date(siteRecords[siteRecords.length - 1].date).getTime()
              : 0;
            return { ...s, lastUse };
          });
          
          sitesWithDates.sort((a, b) => a.lastUse - b.lastUse);
          setNextSuggestedSite(sitesWithDates[0].id);
        }
      } else {
        setNextSuggestedSite(injectionSites[0].id);
      }
    }
  }, [open, preferredSites, injectionSiteRecords]);

  const handleSiteToggle = (siteId: string) => {
    setSelectedSites(prev => {
      if (prev.includes(siteId)) {
        return prev.filter(id => id !== siteId);
      } else {
        if (prev.length >= 3) {
          toast({
            title: t.error,
            description: t.selectPreferredSites,
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, siteId];
      }
    });
  };

  const handleSave = () => {
    if (selectedSites.length < 2) {
      toast({
        title: t.error,
        description: t.selectPreferredSites,
        variant: "destructive",
      });
      return;
    }

    setPreferredSites(selectedSites);
    
    toast({
      title: t.preferredSitesSaved,
      description: `${t.selected} ${selectedSites.length} ${language === "ru" ? "места" : "sites"}`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.selectInjectionSiteTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{t.rotationReminder}</AlertTitle>
            <AlertDescription className="whitespace-pre-line text-xs">
              {t.rotationTips}
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium mb-2">{t.preferredSites}</h4>
            <p className="text-sm text-muted-foreground mb-3">{t.selectPreferredSites}</p>
            
            <div className="relative mb-4">
              <img 
                src={bodyDiagram} 
                alt={t.bodyDiagramAlt}
                className="w-full h-auto max-h-64 mx-auto"
              />
              
              {injectionSites.map((site) => {
                const isNext = nextSuggestedSite === site.id;
                const isLast = lastUsedSite === site.id;
                const isSelected = selectedSites.includes(site.id);
                
                return (
                  <button
                    key={site.id}
                    onClick={() => handleSiteToggle(site.id)}
                    className={cn(
                      "absolute w-7 h-7 rounded-full border-2 transition-all hover:scale-125 shadow-lg",
                      isNext && "bg-red-500 border-red-600 animate-pulse",
                      isLast && !isNext && "bg-blue-500 border-blue-600",
                      !isNext && !isLast && isSelected && "bg-green-500 border-green-600",
                      !isNext && !isLast && !isSelected && "bg-gray-300 border-gray-400"
                    )}
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

            <div className="grid grid-cols-2 gap-2">
              {injectionSites.map((site) => {
                const isNext = nextSuggestedSite === site.id;
                const isLast = lastUsedSite === site.id;
                const isSelected = selectedSites.includes(site.id);
                
                return (
                  <Button
                    key={site.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSiteToggle(site.id)}
                    className={cn(
                      "justify-start h-auto p-2",
                      isNext && "border-red-500 border-2",
                      isLast && !isNext && "border-blue-500 border-2"
                    )}
                  >
                    <div className="text-left w-full">
                      <div className="text-sm font-medium flex items-center gap-1">
                        {site.name}
                        {isNext && <span className="text-red-500">🔴</span>}
                        {isLast && !isNext && <span className="text-blue-500">🔵</span>}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>{t.nextSuggested}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>{t.lastInjection}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>{t.selected}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
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
