import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calculator, Trash2, Settings, Bell, Download } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";
import { NotificationManager } from "@/components/NotificationManager";
import { DataExporter } from "@/components/DataExporter";
import { ThemeSelector } from "@/components/ThemeSelector";

export default function Profile() {
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
      title: "Профиль сохранен",
      description: "Данные успешно обновлены",
    });
  };

  const calculateBMR = () => {
    const { gender, age, height, currentWeight } = formData;
    
    if (!gender || !age || !height || !currentWeight) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля для расчета",
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
      title: "BMR рассчитан",
      description: `Ваш базовый метаболизм: ${Math.round(bmr)} ккал/день`,
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
    setFormData({
      name: "",
      gender: "",
      age: "",
      height: "",
      currentWeight: "",
      targetWeight: "",
      medication: "",
      bmr: "",
    });
    setProfile({
      name: "",
      gender: "",
      age: "",
      height: "",
      currentWeight: "",
      targetWeight: "",
      medication: "",
      bmr: "",
      customFields: [],
    });
    
    // Clear all app data
    localStorage.removeItem("injections");
    localStorage.removeItem("weights");
    localStorage.removeItem("sideEffects");
    localStorage.removeItem("injectionSites");
    localStorage.removeItem("profile");
    localStorage.removeItem("notifications");
    
    toast({
      title: "Данные удалены",
      description: "Все данные пользователя очищены",
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
        <h2 className="text-2xl font-bold">Профиль</h2>
        {formData.bmr && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">BMR</p>
            <p className="text-lg font-semibold text-medical-primary">{formData.bmr} ккал</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Профиль</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Уведомления</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Экспорт</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Настройки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-medical-primary" />
                Личные данные
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Имя пользователя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите ваше имя"
                />
              </div>

              <div>
                <Label>Пол</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите пол" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужчина</SelectItem>
                    <SelectItem value="female">Женщина</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Возраст</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Лет"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Рост</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="см"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentWeight">Текущий вес</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                    placeholder="кг"
                  />
                </div>
                <div>
                  <Label htmlFor="targetWeight">Желаемый вес</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    placeholder="кг"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medication">Препарат</Label>
                <Input
                  id="medication"
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  placeholder="Название препарата или действующее вещество"
                />
              </div>

              {/* Custom Fields */}
              {formData.customFields && formData.customFields.length > 0 && (
                <div className="space-y-3">
                  <Label>Дополнительные поля</Label>
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
                <Label className="mb-2 block">Добавить поле</Label>
                <div className="flex gap-2">
                  <Input
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="Название поля"
                    className="flex-1"
                  />
                  <Select value={newField.type} onValueChange={(value: any) => setNewField({ ...newField, type: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Текст</SelectItem>
                      <SelectItem value="number">Число</SelectItem>
                      <SelectItem value="date">Дата</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addCustomField} size="sm">
                    Добавить
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={calculateBMR} className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Рассчитать BMR
                </Button>
                <Button onClick={handleSave} variant="outline">
                  Сохранить
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Опасная зона
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Удалить все данные пользователя
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Будут удалены все данные о инъекциях, весе, побочных эффектах и настройки профиля.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Удалить
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

        <TabsContent value="settings">
          <ThemeSelector />
        </TabsContent>
      </Tabs>
    </div>
  );
}