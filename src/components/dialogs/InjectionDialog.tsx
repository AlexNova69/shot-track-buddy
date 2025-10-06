import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InjectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InjectionDialog({ open, onOpenChange }: InjectionDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? ru : enUS;
  
  const [injections, setInjections] = useLocalStorage("injections", []);
  const [injectionSiteRecords, setInjectionSiteRecords] = useLocalStorage("injectionSites", []);
  const [preferredSites, setPreferredSites] = useLocalStorage("preferredSites", []);
  const [date, setDate] = useState<Date>(new Date());
  const [dose, setDose] = useState("");
  const [site, setSite] = useState("");
  const [comment, setComment] = useState("");
  const [suggestedSite, setSuggestedSite] = useState<string>("");

  const doseOptions = ["0.25", "0.5", "1", "1.5"];
  
  const allSites = [
    { id: "stomach-left", name: t.stomachLeft },
    { id: "stomach-right", name: t.stomachRight },
    { id: "arm-left", name: t.armLeft },
    { id: "arm-right", name: t.armRight },
  ];

  // Определяем рекомендуемое место
  useEffect(() => {
    if (open) {
      const availableSites = preferredSites.length > 0 
        ? allSites.filter(s => preferredSites.includes(s.id))
        : allSites;

      // Находим последнее использованное место
      if (injectionSiteRecords.length > 0) {
        const lastRecord = injectionSiteRecords[injectionSiteRecords.length - 1];
        const lastSiteId = lastRecord.site;
        
        // Находим места, отличные от последнего
        const otherSites = availableSites.filter(s => s.id !== lastSiteId);
        
        if (otherSites.length > 0) {
          // Находим место, которое давно не использовалось
          const sitesWithDates = otherSites.map(s => {
            const siteRecords = injectionSiteRecords.filter((r: any) => r.site === s.id);
            const lastUse = siteRecords.length > 0 
              ? new Date(siteRecords[siteRecords.length - 1].date).getTime()
              : 0;
            return { ...s, lastUse };
          });
          
          sitesWithDates.sort((a, b) => a.lastUse - b.lastUse);
          setSuggestedSite(sitesWithDates[0].id);
          setSite(sitesWithDates[0].id);
        } else {
          setSuggestedSite(availableSites[0].id);
          setSite(availableSites[0].id);
        }
      } else {
        // Первая инъекция
        setSuggestedSite(availableSites[0].id);
        setSite(availableSites[0].id);
      }
    }
  }, [open, preferredSites, injectionSiteRecords]);

  const getLastInjectionSite = () => {
    if (injectionSiteRecords.length === 0) return null;
    const lastRecord = injectionSiteRecords[injectionSiteRecords.length - 1];
    const siteData = allSites.find(s => s.id === lastRecord.site);
    return siteData?.name;
  };

  const handleSave = () => {
    if (!dose || !site) {
      toast({
        title: t.error,
        description: t.fillRequired,
        variant: "destructive",
      });
      return;
    }

    const selectedSiteData = allSites.find(s => s.id === site);

    // Создаем запись инъекции
    const newInjection = {
      id: Date.now(),
      date: date.toISOString(),
      dose,
      site: selectedSiteData?.name || site,
      comment,
    };

    setInjections([...injections, newInjection]);
    
    // Автоматически создаем запись места укола
    const newSiteRecord = {
      id: Date.now() + 1,
      date: date.toISOString(),
      site: site,
      siteName: selectedSiteData?.name || "",
    };

    setInjectionSiteRecords([...injectionSiteRecords, newSiteRecord]);
    
    // Reset form
    setDate(new Date());
    setDose("");
    setSite("");
    setComment("");
    
    toast({
      title: t.injectionLogged,
      description: `${t.doseField}: ${dose}мг, ${t.siteField}: ${selectedSiteData?.name}`,
    });
    
    onOpenChange(false);
  };

  const availableSiteOptions = preferredSites.length > 0 
    ? allSites.filter(s => preferredSites.includes(s.id))
    : allSites;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.addInjectionTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {getLastInjectionSite() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t.lastInjection}: <strong>{getLastInjectionSite()}</strong>
                <br />
                {t.suggestedSite}: <strong>{allSites.find(s => s.id === suggestedSite)?.name}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label>{t.injectionDate}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale }) : t.selectDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>{t.dose}</Label>
            <Select value={dose} onValueChange={setDose}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectDose} />
              </SelectTrigger>
              <SelectContent>
                {doseOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} {language === "ru" ? "мг" : "mg"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t.injectionSite}</Label>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectSite} />
              </SelectTrigger>
              <SelectContent>
                {availableSiteOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                    {option.id === suggestedSite && " ⭐"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="comment">{t.commentFeelings}</Label>
            <Textarea
              id="comment"
              placeholder={t.describeFeeling}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
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
