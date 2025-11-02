import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

interface InjectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InjectionDialog({ open, onOpenChange }: InjectionDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? ru : enUS;
  
  const [injections, setInjections] = useLocalStorage("injections", []);
  const [date, setDate] = useState<Date>(new Date());
  const [dose, setDose] = useState("");
  const [site, setSite] = useState("");
  const [comment, setComment] = useState("");

  const doseOptions = ["0.25", "0.5", "1", "1.5"];
  const siteOptions = [
    t.stomachRight,
    t.stomachLeft,
    t.armLeft,
    t.armRight
  ];

  const handleSave = () => {
    if (!dose || !site) {
      toast({
        title: t.error,
        description: t.fillRequired,
        variant: "destructive",
      });
      return;
    }

    const newInjection = {
      id: Date.now(),
      date: date.toISOString(),
      dose,
      site,
      comment,
    };

    setInjections([...injections, newInjection]);
    
    // Reset form
    setDate(new Date());
    setDose("");
    setSite("");
    setComment("");
    
    toast({
      title: t.injectionLogged,
      description: `${t.doseField}: ${dose}мг, ${t.siteField}: ${site}`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.addInjectionTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
                {siteOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
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