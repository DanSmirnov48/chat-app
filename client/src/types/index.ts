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