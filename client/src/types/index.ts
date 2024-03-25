//-------------USER TYPES----------------------------------
export type UserImage = {
    key: string;
    name: string;
    url: string;
};

export type IUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo: UserImage;
    role: string;
    createdAt?: string;
    updatedAt?: string;
};

export type INewUser = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirm: string;
};