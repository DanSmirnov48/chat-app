import { createUserAccount, getUserSession, signInAccount, signOutAccount } from "@/lib/backend-api/users";
import { INewUser } from "@/types";
import { useMutation } from "@tanstack/react-query";


// ============================================================
// AUTH QUERIES
// ============================================================
export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user),
        onSuccess: (data) => { },
        onError: (data) => { },
    });
};

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) => signInAccount(user),
        onSuccess: (data) => { },
        onError: (data) => { },
    });
};

export const useSignOutAccount = () => {
    return useMutation({ mutationFn: signOutAccount });
};

export const useGetUserSession = () => {
    return useMutation({
        mutationFn: () => getUserSession(),
        onSuccess: (data) => { },
        onError: (data) => { },
    });
};