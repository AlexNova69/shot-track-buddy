import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { toast } from "sonner";

interface MeasurementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRecord?: any;
}

export function MeasurementsDialog({ open, onOpenChange, editRecord }: MeasurementsDialogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [measurements, setMeasurements] = useLocalStorage("measurements", []);
  
  const [date, setDate] = useState<Date>(new Date());
  const [neck, setNeck] = useState("");
  const [shoulders, setShoulders] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [frontPhoto, setFrontPhoto] = useState<string>("");
  const [sidePhoto, setSidePhoto] = useState<string>("");
  const [backPhoto, setBackPhoto] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setDate(new Date());
      setNeck("");
      setShoulders("");
      setWaist("");
      setHips("");
      setFrontPhoto("");
      setSidePhoto("");
      setBackPhoto("");
    } else if (editRecord) {
      setDate(new Date(editRecord.date));
      setNeck(editRecord.neck?.toString() || "");
      setShoulders(editRecord.shoulders?.toString() || "");
      setWaist(editRecord.waist?.toString() || "");
      setHips(editRecord.hips?.toString() || "");
      setFrontPhoto(editRecord.frontPhoto || "");
      setSidePhoto(editRecord.sidePhoto || "");
      setBackPhoto(editRecord.backPhoto || "");
    }
  }, [open, editRecord]);

  const canAddMeasurement = () => {
    if (measurements.length === 0) return true;
    
    const lastMeasurement = measurements[measurements.length - 1];
    const lastDate = new Date(lastMeasurement.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return lastDate <= weekAgo;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'front') setFrontPhoto(base64);
        if (type === 'side') setSidePhoto(base64);
        if (type === 'back') setBackPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (type: 'front' | 'side' | 'back') => {
    if (type === 'front') setFrontPhoto("");
    if (type === 'side') setSidePhoto("");
    if (type === 'back') setBackPhoto("");
  };

  const handleSubmit = () => {
    if (!editRecord && !canAddMeasurement()) {
      toast.error(t.measurementWeeklyLimit);
      return;
    }

    if (!neck || !shoulders || !waist || !hips) {
      toast.error(t.fillAllMeasurements);
      return;
    }

    const measurementData = {
      date: date.toISOString(),
      neck: parseFloat(neck),
      shoulders: parseFloat(shoulders),
      waist: parseFloat(waist),
      hips: parseFloat(hips),
      frontPhoto,
      sidePhoto,
      backPhoto,
    };

    if (editRecord) {
      const updatedMeasurements = measurements.map((m: any) =>
        m.date === editRecord.date ? measurementData : m
      );
      setMeasurements(updatedMeasurements);
      toast.success(t.measurementUpdated || "Измерение обновлено");
    } else {
      setMeasurements([...measurements, measurementData]);
      toast.success(t.measurementAdded);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRecord ? (t.editMeasurement || "Редактировать измерение") : t.bodyMeasurements}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date picker */}
          <div className="space-y-2">
            <Label>{t.measurementDate}</Label>
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
                  {date ? format(date, "PPP") : <span>{t.pickDate}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Body diagram */}
          <div className="bg-muted/30 rounded-lg p-6">
            <div className="flex justify-center items-center mb-4">
              <svg width="180" height="380" viewBox="0 0 180 380" className="text-medical-primary">
                {/* Head */}
                <circle cx="90" cy="30" r="20" fill="currentColor" opacity="0.2" />
                {/* Neck marker */}
                <line x1="70" y1="55" x2="110" y2="55" stroke="currentColor" strokeWidth="2" />
                <text x="120" y="58" fontSize="12" fill="currentColor">{t.neck}</text>
                
                {/* Body */}
                <ellipse cx="90" cy="120" rx="35" ry="60" fill="currentColor" opacity="0.2" />
                {/* Shoulders marker */}
                <line x1="50" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="2" />
                <text x="135" y="83" fontSize="12" fill="currentColor">{t.shoulders}</text>
                
                {/* Waist marker */}
                <line x1="60" y1="130" x2="120" y2="130" stroke="currentColor" strokeWidth="2" />
                <text x="125" y="133" fontSize="12" fill="currentColor">{t.waist}</text>
                
                {/* Hips */}
                <ellipse cx="90" cy="200" rx="40" ry="30" fill="currentColor" opacity="0.2" />
                {/* Hips marker */}
                <line x1="50" y1="200" x2="130" y2="200" stroke="currentColor" strokeWidth="2" />
                <text x="135" y="203" fontSize="12" fill="currentColor">{t.hips}</text>
                
                {/* Legs */}
                <rect x="65" y="230" width="20" height="140" fill="currentColor" opacity="0.2" rx="10" />
                <rect x="95" y="230" width="20" height="140" fill="currentColor" opacity="0.2" rx="10" />
              </svg>
            </div>
          </div>

          {/* Measurement inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.neck} ({t.cm})</Label>
              <Input
                type="number"
                step="0.1"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder="32"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.shoulders} ({t.cm})</Label>
              <Input
                type="number"
                step="0.1"
                value={shoulders}
                onChange={(e) => setShoulders(e.target.value)}
                placeholder="110"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.waist} ({t.cm})</Label>
              <Input
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="85"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.hips} ({t.cm})</Label>
              <Input
                type="number"
                step="0.1"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>

          {/* Photo uploads */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t.progressPhotos}</Label>
            <div className="grid grid-cols-3 gap-4">
              {/* Front photo */}
              <div className="space-y-2">
                <Label className="text-sm">{t.frontView}</Label>
                {frontPhoto ? (
                  <div className="relative">
                    <img src={frontPhoto} alt="Front" className="w-full h-32 object-cover rounded-md" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removePhoto('front')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">{t.uploadPhoto}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, 'front')}
                    />
                  </label>
                )}
              </div>

              {/* Side photo */}
              <div className="space-y-2">
                <Label className="text-sm">{t.sideView}</Label>
                {sidePhoto ? (
                  <div className="relative">
                    <img src={sidePhoto} alt="Side" className="w-full h-32 object-cover rounded-md" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removePhoto('side')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">{t.uploadPhoto}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, 'side')}
                    />
                  </label>
                )}
              </div>

              {/* Back photo */}
              <div className="space-y-2">
                <Label className="text-sm">{t.backView}</Label>
                {backPhoto ? (
                  <div className="relative">
                    <img src={backPhoto} alt="Back" className="w-full h-32 object-cover rounded-md" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removePhoto('back')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">{t.uploadPhoto}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, 'back')}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Info message */}
          {!editRecord && !canAddMeasurement() && (
            <div className="p-3 bg-medical-warning/10 border border-medical-warning/20 rounded-md">
              <p className="text-sm text-medical-warning">{t.measurementWeeklyLimit}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={!editRecord && !canAddMeasurement()}
            >
              {editRecord ? (t.update || "Обновить") : t.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
