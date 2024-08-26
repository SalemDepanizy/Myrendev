// NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  id: number;
  message: string;
  timestamp: number;
  read: boolean; // Add read property
}

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number; // Track unread count
  addNotification: (message: string) => void;
  markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

let nextId = 0;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (message: string) => {
    const newNotification: Notification = {
      id: nextId++,
      message,
      timestamp: Date.now(),
      read: false, // Notification starts as unread
    };
    setNotifications((prev) => [...prev, newNotification]);
    setUnreadCount((prevCount) => prevCount + 1); // Increment unread count
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prevCount) => prevCount - 1); // Decrement unread count
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
