import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";

interface WeightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeightDialog({ open, onOpenChange }: WeightDialogProps) {
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState("");

  const handleSave = () => {
    if (!weight) {
      toast({
        title: "Ошибка",
        description: "Введите вес",
        variant: "destructive",
      });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректное значение веса",
        variant: "destructive",
      });
      return;
    }

    const newWeight = {
      id: Date.now(),
      date: date.toISOString(),
      weight: weightNum.toString(),
    };

    setWeights([...weights, newWeight]);
    
    // Reset form
    setDate(new Date());
    setWeight("");
    
    toast({
      title: "Вес записан",
      description: `${weightNum}кг на ${format(date, "dd.MM.yyyy")}`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить вес</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Дата взвешивания</Label>
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
                  {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
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
            <Label htmlFor="weight">Вес (кг)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Введите ваш вес"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              Сохранить
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}