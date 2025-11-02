import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calculator, Trash2, Settings, Bell, Download } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { NotificationManager } from "@/components/NotificationManager";
import { DataExporter } from "@/components/DataExporter";
import { ThemeSelector } from "@/components/ThemeSelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { translations } from "@/lib/translations";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [profile, setProfile] = useLocalStorage("profile", {
    name: "",
    gender: "",
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    medication: "",
    bmr: "",
    customFields: [] as Array<{ id: string; name: string; value: string; type: "text" | "number" | "date" }>,
  });

  const [formData, setFormData] = useState(profile);
  const [newField, setNewField] = useState({ name: "", type: "text" as const });

  const handleSave = () => {
    setProfile(formData);
    toast({
      title: t.profileSaved,
      description: t.dataSavedSuccess,
    });
  };

  const calculateBMR = () => {
    const { gender, age, height, currentWeight } = formData;
    
    if (!gender || !age || !height || !currentWeight) {
      toast({
        title: t.error,
        description: t.fillAllFields,
        variant: "destructive",
      });
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = parseFloat(currentWeight);

    let bmr: number;
    
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    setFormData({ ...formData, bmr: Math.round(bmr).toString() });
    toast({
      title: t.bmrCalculated,
      description: `${t.bmrResult}: ${Math.round(bmr)} ${t.kcalPerDay}`,
    });
  };

  const deleteProfile = () => {
    const emptyProfile = {
      name: "",
      gender: "",
      age: "",
      height: "",
      currentWeight: "",
      targetWeight: "",
      medication: "",
      bmr: "",
      customFields: [] as Array<{ id: string; name: string; value: string; type: "text" | "number" | "date" }>,
    };
    setFormData(emptyProfile);
    setProfile(emptyProfile);
    
    // Clear all app data
    localStorage.removeItem("injections");
    localStorage.removeItem("weights");
    localStorage.removeItem("sideEffects");
    localStorage.removeItem("injectionSites");
    localStorage.removeItem("profile");
    localStorage.removeItem("notifications");
    
    toast({
      title: t.dataDeleted,
      description: t.allDataCleared,
    });
  };

  const addCustomField = () => {
    if (!newField.name.trim()) return;
    
    const field = {
      id: Date.now().toString(),
      name: newField.name,
      value: "",
      type: newField.type,
    };
    
    setFormData({
      ...formData,
      customFields: [...formData.customFields, field],
    });
    
    setNewField({ name: "", type: "text" });
  };

  const updateCustomField = (id: string, value: string) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.map(field =>
        field.id === id ? { ...field, value } : field
      ),
    });
  };

  const deleteCustomField = (id: string) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter(field => field.id !== id),
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.profile}</h2>
        {formData.bmr && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">BMR</p>
            <p className="text-lg font-semibold text-medical-primary">{formData.bmr} {t.kcal}</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t.profile}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t.notifications}</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t.export}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t.settings}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-medical-primary" />
                {t.personalData}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t.username}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.enterName}
                />
              </div>

              <div>
                <Label>{t.gender}</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectGender} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.male}</SelectItem>
                    <SelectItem value="female">{t.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">{t.age}</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder={t.years}
                  />
                </div>
                <div>
                  <Label htmlFor="height">{t.height}</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder={t.cm}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentWeight">{t.currentWeight}</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                    placeholder={t.kg}
                  />
                </div>
                <div>
                  <Label htmlFor="targetWeight">{t.targetWeight}</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    placeholder={t.kg}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medication">{t.medication}</Label>
                <Input
                  id="medication"
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  placeholder={t.medicationPlaceholder}
                />
              </div>

              {/* Custom Fields */}
              {formData.customFields && formData.customFields.length > 0 && (
                <div className="space-y-3">
                  <Label>{t.additionalFields}</Label>
                  {formData.customFields.map((field) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, e.target.value)}
                        placeholder={field.name}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCustomField(field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Field */}
              <div className="border-t pt-4">
                <Label className="mb-2 block">{t.addField}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder={t.fieldName}
                    className="flex-1"
                  />
                  <Select value={newField.type} onValueChange={(value: any) => setNewField({ ...newField, type: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">{t.text}</SelectItem>
                      <SelectItem value="number">{t.number}</SelectItem>
                      <SelectItem value="date">{t.dateField}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addCustomField} size="sm">
                    {t.add}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={calculateBMR} className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  {t.calculateBMR}
                </Button>
                <Button onClick={handleSave} variant="outline">
                  {t.save}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t.dangerZone}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    {t.deleteAllData}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.deleteWarning}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t.delete}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationManager />
        </TabsContent>

        <TabsContent value="export">
          <DataExporter />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ThemeSelector />
          <LanguageSelector />
        </TabsContent>
      </Tabs>

      {/* App Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t.appName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">{t.appVersion}: 1.0.0</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">{t.appAuthor}: Aleksandr Kesarev</p>
          </div>
          <Separator />
          <div>
            <CardDescription className="text-xs leading-relaxed">
              {t.appDescription}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}