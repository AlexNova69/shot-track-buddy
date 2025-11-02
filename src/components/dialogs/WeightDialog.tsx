import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface WeightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRecord?: any;
}

export function WeightDialog({ open, onOpenChange, editRecord }: WeightDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? ru : enUS;
  
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState("");

  // Заполняем форму при редактировании
  useEffect(() => {
    if (open && editRecord) {
      setDate(new Date(editRecord.date));
      setWeight(editRecord.weight);
    } else if (open && !editRecord) {
      setDate(new Date());
      setWeight("");
    }
  }, [open, editRecord]);

  const handleSave = () => {
    if (!weight) {
      toast({
        title: t.error,
        description: t.enterWeightError,
        variant: "destructive",
      });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast({
        title: t.error,
        description: t.correctWeightError,
        variant: "destructive",
      });
      return;
    }

    if (editRecord) {
      // Редактирование существующей записи
      const updatedWeights = weights.map((w: any) =>
        w.id === editRecord.id
          ? {
              ...w,
              date: date.toISOString(),
              weight: weightNum.toString(),
            }
          : w
      );
      setWeights(updatedWeights);

      toast({
        title: t.recordUpdated || "Запись обновлена",
        description: `${weightNum}${language === "ru" ? "кг" : "kg"} ${language === "ru" ? "на" : "on"} ${format(date, "dd.MM.yyyy")}`,
      });
    } else {
      // Создание новой записи
      const newWeight = {
        id: Date.now(),
        date: date.toISOString(),
        weight: weightNum.toString(),
      };

      setWeights([...weights, newWeight]);

      toast({
        title: t.weightLogged,
        description: `${weightNum}${language === "ru" ? "кг" : "kg"} ${language === "ru" ? "на" : "on"} ${format(date, "dd.MM.yyyy")}`,
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editRecord ? (t.editWeight || "Редактировать вес") : t.addWeightTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>{t.weighingDate}</Label>
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
            <Label htmlFor="weight">{t.weight}</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder={t.enterWeight}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
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