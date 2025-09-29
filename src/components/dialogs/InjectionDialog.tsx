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
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";

interface InjectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InjectionDialog({ open, onOpenChange }: InjectionDialogProps) {
  const [injections, setInjections] = useLocalStorage("injections", []);
  const [date, setDate] = useState<Date>(new Date());
  const [dose, setDose] = useState("");
  const [site, setSite] = useState("");
  const [comment, setComment] = useState("");

  const doseOptions = ["0.25", "0.5", "1", "1.5"];
  const siteOptions = [
    "Живот справа",
    "Живот слева", 
    "Рука слева",
    "Рука справа"
  ];

  const handleSave = () => {
    if (!dose || !site) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
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
      title: "Инъекция записана",
      description: `Доза ${dose}мг, место: ${site}`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить инъекцию</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Дата укола</Label>
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
            <Label>Доза (мг)</Label>
            <Select value={dose} onValueChange={setDose}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите дозу" />
              </SelectTrigger>
              <SelectContent>
                {doseOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} мг
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Место укола</Label>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите место" />
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
            <Label htmlFor="comment">Комментарий ощущений</Label>
            <Textarea
              id="comment"
              placeholder="Опишите ощущения после укола..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
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