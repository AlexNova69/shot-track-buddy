import { useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  enabled: boolean;
  repeat: "daily" | "weekly" | "monthly" | "custom";
  customDays?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>("notifications", []);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window && permission !== "granted") {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    }
    return permission === "granted";
  };

  const scheduleNotification = (notification: Notification) => {
    if (permission !== "granted") return;

    const now = new Date();
    const [hours, minutes] = notification.time.split(":").map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      if (notification.enabled) {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        });
      }
    }, timeUntilNotification);
  };

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications([...notifications, newNotification]);
    if (newNotification.enabled) {
      scheduleNotification(newNotification);
    }
    return newNotification;
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, ...updates } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const toggleNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      updateNotification(id, { enabled: !notification.enabled });
      if (!notification.enabled) {
        scheduleNotification({ ...notification, enabled: true });
      }
    }
  };

  return {
    notifications,
    permission,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
  };
}