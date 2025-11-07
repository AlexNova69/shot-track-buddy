import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Syringe, CalendarIcon, Trash2, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSyringeManagement } from "@/hooks/useSyringeManagement";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SyringeManager() {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? ru : enUS;
  
  const { 
    syringes, 
    calculateSyringeStatus, 
    addSyringe, 
    activateSyringe, 
    deleteSyringe 
  } = useSyringeManagement();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSyringeData, setNewSyringeData] = useState({
    startDate: new Date(),
    capacity: "3",
    type: "0.25-0.5" as '0.25-0.5' | '1.0',
  });

  const syringeStatus = calculateSyringeStatus();

  const handleAddSyringe = () => {
    if (!newSyringeData.capacity || parseFloat(newSyringeData.capacity) <= 0) {
      toast({
        title: t.error,
        description: t.fillRequired,
        variant: "destructive",
      });
      return;
    }

    addSyringe({
      startDate: newSyringeData.startDate.toISOString(),
      capacity: parseFloat(newSyringeData.capacity),
      type: newSyringeData.type,
      isActive: syringes.length === 0, // Первый шприц автоматически активен
    });

    toast({
      title: t.syringeAdded,
      description: t.syringeAddedSuccess,
    });

    setShowAddForm(false);
    setNewSyringeData({
      startDate: new Date(),
      capacity: "3",
      type: "0.25-0.5",
    });
  };

  const handleActivateSyringe = (id: string) => {
    activateSyringe(id);
    toast({
      title: t.syringeActivated,
      description: t.syringeActivatedSuccess,
    });
  };

  const handleDeleteSyringe = (id: string) => {
    deleteSyringe(id);
    toast({
      title: t.syringeDeleted,
      description: t.syringeDeletedSuccess,
    });
  };

  return (
    <div className="space-y-6">
      {/* Текущий статус шприца */}
      {syringeStatus.currentSyringe && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-primary" />
              {t.currentSyringeStatus}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t.syringeType}</p>
                <p className="text-lg font-semibold">
                  {syringeStatus.currentSyringe.type === '0.25-0.5' 
                    ? '0.25 / 0.5 ' + t.mg
                    : '1.0 ' + t.mg}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.capacity}</p>
                <p className="text-lg font-semibold">
                  {syringeStatus.currentSyringe.capacity} {t.ml}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.usedVolume}</p>
                <p className="text-lg font-semibold">
                  {syringeStatus.usedVolume.toFixed(2)} {t.ml}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.remainingVolume}</p>
                <p className="text-lg font-semibold text-primary">
                  {syringeStatus.remainingVolume.toFixed(2)} {t.ml}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t.remainingInjections}</span>
                <span className="text-lg font-bold">
                  {syringeStatus.remainingInjections}
                </span>
              </div>
              
              {syringeStatus.dateToReplace && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t.buyNewSyringeBy}:</strong>
                    <br />
                    {format(syringeStatus.dateToReplace, "d MMMM yyyy", { locale })}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список всех шприцов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5" />
                {t.syringeHistory}
              </CardTitle>
              <CardDescription>{t.syringeHistoryDesc}</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? t.cancel : t.addSyringe}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Форма добавления */}
          {showAddForm && (
            <Card className="p-4 bg-muted/50">
              <div className="space-y-4">
                <div>
                  <Label>{t.startDate}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newSyringeData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newSyringeData.startDate, "PPP", { locale })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newSyringeData.startDate}
                        onSelect={(date) => date && setNewSyringeData({ ...newSyringeData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>{t.syringeType}</Label>
                  <Select 
                    value={newSyringeData.type}
                    onValueChange={(value: '0.25-0.5' | '1.0') => 
                      setNewSyringeData({ ...newSyringeData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.25-0.5">
                        0.25 {t.mg} / 0.5 {t.mg}
                      </SelectItem>
                      <SelectItem value="1.0">
                        1.0 {t.mg}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t.capacity} ({t.ml})</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newSyringeData.capacity}
                    onChange={(e) => setNewSyringeData({ ...newSyringeData, capacity: e.target.value })}
                    placeholder="3"
                  />
                </div>

                <Button onClick={handleAddSyringe} className="w-full">
                  {t.addSyringe}
                </Button>
              </div>
            </Card>
          )}

          {/* Список шприцов */}
          {syringes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Syringe className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t.noSyringesYet}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syringes.map((syringe) => (
                <Card key={syringe.id} className={cn(
                  "p-4",
                  syringe.isActive && "border-primary/50 bg-primary/5"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {syringe.isActive && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t.active}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {syringe.type === '0.25-0.5' 
                            ? '0.25 / 0.5 ' + t.mg
                            : '1.0 ' + t.mg}
                        </Badge>
                        <Badge variant="secondary">
                          {syringe.capacity} {t.ml}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.startDate}: {format(new Date(syringe.startDate), "d MMMM yyyy", { locale })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!syringe.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivateSyringe(syringe.id)}
                        >
                          {t.activate}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSyringe(syringe.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
