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

export type IMessage = {
    id: string;
    content: string;
    senderId: string;
    chatId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type INewMessage = {
    chatId: string;
    senderId: string;
    content: string;
}