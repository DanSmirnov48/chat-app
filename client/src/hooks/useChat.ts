import { create } from 'zustand'
import { Socket } from 'socket.io-client';
import { IChatWithUser, IUser } from '@/types';

interface OnlineUser {
    userId: string;
    socketId: string;
}

interface OnlineUsersStore {
    onlineUsers: OnlineUser[];
    selectedChatId: IChatWithUser['id'] | null;
    socket: Socket | null;
    recipient: IUser | null;
    setOnlineUsers: (onlineUsers: OnlineUser[]) => void;
    setSelectedChatId: (chatId: IChatWithUser['id'] | null) => void;
    setSocket: (socket: Socket | null) => void;
    setRecipient: (recipient: IUser | null) => void;
}

export const useChatStore = create<OnlineUsersStore>((set) => ({
    onlineUsers: [],
    selectedChatId: null,
    socket: null,
    recipient: null,
    setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
    setSocket: (socket) => set({ socket }),
    setRecipient: (recipient) => set({ recipient }),
}));