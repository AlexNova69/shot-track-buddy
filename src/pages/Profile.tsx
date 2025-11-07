import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calculator, Trash2, Settings, Bell, Download, TrendingUp, Syringe } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { APP_VERSION } from "@/lib/version";
import { NotificationManager } from "@/components/NotificationManager";
import { DataExporter } from "@/components/DataExporter";
import { ThemeSelector } from "@/components/ThemeSelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TitrationWidget } from "@/components/TitrationWidget";
import { SyringeManager } from "@/components/SyringeManager";
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
    activityLevel: "",
    tdee: "",
    deficitCalories: "",
    maintenanceCalories: "",
    surplusCalories: "",
    customFields: [] as Array<{ id: string; name: string; value: string; type: "text" | "number" | "date" }>,
  });

  const [weights] = useLocalStorage("weights", []);

  const [formData, setFormData] = useState(profile);
  const [newField, setNewField] = useState({ name: "", type: "text" as const });

  const handleSave = () => {
    setProfile(formData);
    toast({
      title: t.profileSaved,
      description: t.dataSavedSuccess,
    });
  };

  const getLatestWeight = () => {
    if (weights.length === 0) return null;
    const sortedWeights = [...weights].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return parseFloat(sortedWeights[0].weight);
  };

  const calculateBMR = () => {
    const { gender, age, height, activityLevel } = formData;
    const latestWeight = getLatestWeight();
    
    if (!gender || !age || !height || !latestWeight) {
      toast({
        title: t.error,
        description: t.fillAllFieldsAndWeight,
        variant: "destructive",
      });
      return;
    }

    if (!activityLevel) {
      toast({
        title: t.error,
        description: t.selectActivityLevel,
        variant: "destructive",
      });
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = latestWeight;

    let bmr: number;
    
    // Mifflin-St Jeor Formula
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    // Activity multipliers
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,      // Minimal or no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Heavy exercise 6-7 days/week
    };

    const tdee = bmr * activityMultipliers[activityLevel];
    const deficitCalories = Math.round(tdee - 500); // 500 calorie deficit for weight loss
    const maintenanceCalories = Math.round(tdee);
    const surplusCalories = Math.round(tdee + 300); // 300 calorie surplus for weight gain

    setFormData({ 
      ...formData, 
      bmr: Math.round(bmr).toString(),
      tdee: Math.round(tdee).toString(),
      deficitCalories: deficitCalories.toString(),
      maintenanceCalories: maintenanceCalories.toString(),
      surplusCalories: surplusCalories.toString(),
    });
    
    toast({
      title: t.bmrCalculated,
      description: `${t.bmrResult}: ${Math.round(bmr)} ${t.kcalPerDay}`,
    });
  };

  const getCurrentBMI = () => {
    const latestWeight = getLatestWeight();
    const heightNum = parseInt(formData.height);
    
    if (!latestWeight || !heightNum) return null;
    
    const heightInMeters = heightNum / 100;
    const bmi = latestWeight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
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
      activityLevel: "",
      tdee: "",
      deficitCalories: "",
      maintenanceCalories: "",
      surplusCalories: "",
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
        <div className="flex gap-4">
          {getCurrentBMI() && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">BMI</p>
              <p className="text-lg font-semibold text-medical-primary">{getCurrentBMI()}</p>
            </div>
          )}
          {formData.bmr && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">BMR</p>
              <p className="text-lg font-semibold text-medical-primary">{formData.bmr} {t.kcal}</p>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t.profile}</span>
          </TabsTrigger>
          <TabsTrigger value="titration" className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">{t.titrationSchedule}</span>
          </TabsTrigger>
          <TabsTrigger value="syringes" className="flex items-center gap-1">
            <Syringe className="w-4 h-4" />
            <span className="hidden sm:inline">{t.syringeManagement}</span>
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

              <Button onClick={handleSave} variant="outline" className="w-full">
                {t.save}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-medical-primary" />
                {t.calorieCalculator}
              </CardTitle>
              <CardDescription>
                {t.calorieCalculatorDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium">{t.currentWeight}:</p>
                <p className="text-2xl font-bold text-medical-primary">
                  {getLatestWeight() ? `${getLatestWeight()} ${t.kg}` : t.noWeightData}
                </p>
                <p className="text-xs text-muted-foreground">{t.basedOnLatestRecord}</p>
              </div>

              <div>
                <Label>{t.activityLevel}</Label>
                <Select value={formData.activityLevel} onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectActivityLevel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">{t.sedentary}</SelectItem>
                    <SelectItem value="light">{t.lightActivity}</SelectItem>
                    <SelectItem value="moderate">{t.moderateActivity}</SelectItem>
                    <SelectItem value="active">{t.activeActivity}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateBMR} className="w-full flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                {t.calculateBMR}
              </Button>

              {formData.bmr && formData.tdee && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium mb-3">{t.calculationResults}</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t.basalMetabolicRate}</p>
                        <p className="text-xl font-bold text-medical-primary">{formData.bmr} {t.kcalPerDay}</p>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t.totalDailyExpenditure}</p>
                        <p className="text-xl font-bold text-medical-primary">{formData.tdee} {t.kcalPerDay}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">{t.calorieGoals}</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t.weightLoss}</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formData.deficitCalories} {t.kcalPerDay}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t.deficitDesc}</p>
                      </div>

                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t.weightMaintenance}</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formData.maintenanceCalories} {t.kcalPerDay}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t.maintenanceDesc}</p>
                      </div>

                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t.weightGain}</p>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formData.surplusCalories} {t.kcalPerDay}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t.surplusDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

        <TabsContent value="titration">
          <TitrationWidget />
        </TabsContent>

        <TabsContent value="syringes">
          <SyringeManager />
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
            <p className="font-medium">{t.appVersion}: {APP_VERSION}</p>
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