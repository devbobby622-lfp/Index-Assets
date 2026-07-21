import { createContext, useContext, ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

type NotifyType = 'success' | 'error' | 'info' | 'warning';

interface NotifyOptions {
  description?: string;
  duration?: number;
}

interface NotificationContextType {
  notify: (message: string, type?: NotifyType, options?: NotifyOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notify = (message: string, type: NotifyType = 'info', options?: NotifyOptions) => {
    switch (type) {
      case 'success':
        sonnerToast.success(message, { description: options?.description, duration: options?.duration });
        break;
      case 'error':
        sonnerToast.error(message, { description: options?.description, duration: options?.duration });
        break;
      case 'warning':
        sonnerToast.warning(message, { description: options?.description, duration: options?.duration });
        break;
      default:
        sonnerToast.info(message, { description: options?.description, duration: options?.duration });
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider');
  return ctx.notify;
}
