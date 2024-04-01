import { createUserAccount, getAllUsers, getUserSession, signInAccount, signOutAccount } from "@/lib/backend-api/users";
import { INewUser } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";


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

export const useGetAllUsers = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ALL_USERS],
        queryFn: () => getAllUsers(),
    });
};