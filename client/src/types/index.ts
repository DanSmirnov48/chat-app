//-------------USER TYPES----------------------------------

export type IUser = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

export type INewUser = {
    name: string;
    email: string;
    password: string;
};

export type IChatWithUser = {
    id: string;
    users: IUser[]
    createdAt: string;
    updatedAt: string;
};

interface IMessageBase {
    id: string;
    content: string;
    senderId: string;
    chatId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessage extends IMessageBase {
    status: MessageStatus;
}

export enum MessageStatus {
    SENDING = "SENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
}

export interface IChatWithMessages extends IChatWithUser {
    Message: IMessage[];
}

export type INewMessageBase = Omit<IMessageBase, 'id' | 'createdAt' | 'updatedAt'>;

export type INewMessage = INewMessageBase & {
    status: MessageStatus;
}

export type INotification = INewMessage & { id: string, date: Date, isRead: boolean, messageId: string };

export type getMessage = {
    chatId: string;
    content: string;
    messageId: string;
    recipientId: string;
    senderId: string;
    status: string;
}