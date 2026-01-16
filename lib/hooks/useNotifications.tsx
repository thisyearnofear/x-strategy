'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? (notification.type === 'error' ? 8000 : 5000),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 5));

    if (newNotification.duration) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes('user rejected')) {
      return 'Transaction rejected by user';
    }

    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for this transaction';
    }

    if (message.includes('AlreadyCompleted')) {
      return 'This action has already been completed';
    }

    if (message.includes('NotActive')) {
      return 'Strategy is not currently active';
    }

    if (message.includes('DeadlinePassed')) {
      return 'This strategy has passed its deadline';
    }

    if (message.includes('BelowMinimum')) {
      return 'Amount is below the minimum required';
    }

    if (message.includes('InsufficientStake')) {
      return 'Insufficient stake amount required';
    }

    if (message.includes('SlippageExceeded')) {
      return 'Price changed too much. Please try again';
    }

    if (message.includes('network')) {
      return 'Network error. Please check your connection';
    }

    if (message.includes('0x')) {
      const match = message.match(/0x[a-fA-F0-9]+/);
      if (match) {
        return `Transaction error: ${match[0]}`;
      }
    }

    return message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}
