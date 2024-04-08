import { INotification } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type NotificationStore = {
    notifications: INotification[];
    addNotification: (notification: INotification) => void;
    markNotificationAsRead: (notificationId: string) => void;
    removeNotification: (notificationId: string) => void;
    clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set) => ({
            notifications: [],
            addNotification: (notification) =>
                set((state) => ({ notifications: [...state.notifications, notification] })),
            markNotificationAsRead: (notificationId) =>
                set((state) => ({
                    notifications: state.notifications.map((notification) =>
                        notification.id === notificationId ? { ...notification, isRead: true } : notification
                    ),
                })),
            removeNotification: (notificationId) =>
                set((state) => ({
                    notifications: state.notifications.filter((notification) => notification.id !== notificationId),
                })),
            clearNotifications: () => {
                set({ notifications: [] });
            },
        }),
        {
            name: 'chat-app-notifications',
            storage: createJSONStorage(() => localStorage),
        }
    )
);