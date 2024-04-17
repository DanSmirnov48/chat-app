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


interface DialogState {
    signInOpen: boolean;
    signUpOpen: boolean;

    setSignInOpen: (open: boolean) => void;
    setSignUpOpen: (open: boolean) => void;

    dialogContent: React.ReactNode | null;
    setDialogContent: (content: React.ReactNode | null) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
    signInOpen: false,
    signUpOpen: false,

    setSignInOpen: (open) => set({ signInOpen: open }),
    setSignUpOpen: (open) => set({ signUpOpen: open }),

    dialogContent: null,
    setDialogContent: (content) => set({ dialogContent: content }),
}));