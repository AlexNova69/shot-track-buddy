import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface SideEffectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRecord?: any;
}

export function SideEffectDialog({ open, onOpenChange, editRecord }: SideEffectDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? ru : enUS;
  
  const [sideEffects, setSideEffects] = useLocalStorage("sideEffects", []);
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");

  // Заполняем форму при редактировании
  useEffect(() => {
    if (open && editRecord) {
      setDate(new Date(editRecord.date));
      setDescription(editRecord.description || "");
    } else if (open && !editRecord) {
      setDate(new Date());
      setDescription("");
    }
  }, [open, editRecord]);

  const handleSave = () => {
    if (!description.trim()) {
      toast({
        title: t.error,
        description: t.enterDescription,
        variant: "destructive",
      });
      return;
    }

    if (editRecord) {
      // Редактирование существующей записи
      const updatedSideEffects = sideEffects.map((se: any) =>
        se.id === editRecord.id
          ? {
              ...se,
              date: date.toISOString(),
              description: description.trim(),
            }
          : se
      );
      setSideEffects(updatedSideEffects);

      toast({
        title: t.recordUpdated || "Запись обновлена",
        description: t.recordSaved,
      });
    } else {
      // Создание новой записи
      const newSideEffect = {
        id: Date.now(),
        date: date.toISOString(),
        description: description.trim(),
      };

      setSideEffects([...sideEffects, newSideEffect]);

      toast({
        title: t.sideEffectLogged,
        description: t.recordSaved,
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editRecord ? (t.editSideEffect || "Редактировать побочный эффект") : t.logSideEffectTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>{t.observationDate}</Label>
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
            <Label htmlFor="description">{t.descriptionComments}</Label>
            <Textarea
              id="description"
              placeholder={t.describeSideEffects}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
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