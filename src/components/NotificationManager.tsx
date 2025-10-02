import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, Clock } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export function NotificationManager() {
  const { language } = useLanguage();
  const t = translations[language];
  const { notifications, permission, requestPermission, addNotification, updateNotification, deleteNotification, toggleNotification } = useNotifications();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: t.injectionReminder,
    message: t.timeForShot,
    time: "09:00",
    repeat: "daily" as const,
    customDays: 1,
    enabled: true,
  });

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: t.permissionGranted,
        description: t.nowReceiveNotifications,
      });
    } else {
      toast({
        title: t.permissionDenied,
        description: t.enableInBrowser,
        variant: "destructive",
      });
    }
  };

  const handleAddNotification = () => {
    addNotification(newNotification);
    setNewNotification({
      title: t.injectionReminder,
      message: t.timeForShot,
      time: "09:00",
      repeat: "daily",
      customDays: 1,
      enabled: true,
    });
    setIsDialogOpen(false);
    toast({
      title: t.reminderAdded,
      description: t.notificationScheduled,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-medical-primary" />
            {t.reminders}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.newReminder}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t.title}</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="message">{t.message}</Label>
                  <Input
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">{t.time}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newNotification.time}
                    onChange={(e) => setNewNotification({ ...newNotification, time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t.repeat}</Label>
                  <Select value={newNotification.repeat} onValueChange={(value: any) => setNewNotification({ ...newNotification, repeat: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t.daily}</SelectItem>
                      <SelectItem value="weekly">{t.weekly}</SelectItem>
                      <SelectItem value="monthly">{t.monthly}</SelectItem>
                      <SelectItem value="custom">{t.customDays}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newNotification.repeat as string) === "custom" && (
                  <div>
                    <Label htmlFor="customDays">{t.daysCount}</Label>
                    <Input
                      id="customDays"
                      type="number"
                      min="1"
                      value={newNotification.customDays}
                      onChange={(e) => setNewNotification({ ...newNotification, customDays: parseInt(e.target.value) })}
                    />
                  </div>
                )}
                <Button onClick={handleAddNotification} className="w-full">
                  {t.addReminder}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission !== "granted" && (
          <div className="p-4 bg-medical-warning/10 border border-medical-warning/20 rounded-lg">
            <p className="text-sm text-medical-warning mb-2">{t.permissionRequired}</p>
            <Button onClick={handlePermissionRequest} size="sm">
              {t.allowNotifications}
            </Button>
          </div>
        )}
        
        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">{t.noReminders}</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-medical-primary" />
                    <span className="font-medium">{notification.time}</span>
                    <span className="text-sm text-muted-foreground">
                      {notification.repeat === "daily" ? t.daily :
                       notification.repeat === "weekly" ? t.weekly :
                       notification.repeat === "monthly" ? t.monthly :
                       `${t.through} ${notification.customDays} ${t.days}`}
                    </span>
                  </div>
                  <p className="text-sm">{notification.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notification.enabled}
                    onCheckedChange={() => toggleNotification(notification.id)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}