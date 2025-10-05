import { useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { LocalNotifications } from '@capacitor/local-notifications';

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
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt" | "prompt-with-rationale">("prompt");

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const result = await LocalNotifications.checkPermissions();
      setPermission(result.display);
    } catch (error) {
      console.error("Error checking notification permissions:", error);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      setPermission(result.display);
      return result.display === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };

  const scheduleNotification = async (notification: Notification) => {
    if (permission !== "granted") return;

    try {
      // Cancel existing notification with this ID first
      await LocalNotifications.cancel({ notifications: [{ id: parseInt(notification.id) }] });

      const [hours, minutes] = notification.time.split(":").map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      // Determine repeat interval
      let every: "day" | "week" | "month" | undefined;
      let count: number | undefined;

      switch (notification.repeat) {
        case "daily":
          every = "day";
          break;
        case "weekly":
          every = "week";
          break;
        case "monthly":
          every = "month";
          break;
        case "custom":
          if (notification.customDays) {
            every = "day";
            count = notification.customDays;
          }
          break;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(notification.id),
            title: notification.title,
            body: notification.message,
            schedule: {
              at: scheduledTime,
              every,
              count,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  const addNotification = async (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications([...notifications, newNotification]);
    if (newNotification.enabled) {
      await scheduleNotification(newNotification);
    }
    return newNotification;
  };

  const updateNotification = async (id: string, updates: Partial<Notification>) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, ...updates } : n
    );
    setNotifications(updatedNotifications);
    
    // Reschedule if enabled
    const updatedNotification = updatedNotifications.find(n => n.id === id);
    if (updatedNotification?.enabled) {
      await scheduleNotification(updatedNotification);
    } else if (updatedNotification && !updatedNotification.enabled) {
      // Cancel if disabled
      await LocalNotifications.cancel({ notifications: [{ id: parseInt(id) }] });
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    try {
      await LocalNotifications.cancel({ notifications: [{ id: parseInt(id) }] });
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  };

  const toggleNotification = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      await updateNotification(id, { enabled: !notification.enabled });
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