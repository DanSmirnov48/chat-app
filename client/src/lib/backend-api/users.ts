import { INewUser } from "@/types";
import axios from "axios";

// ============================================================
// USER
// ============================================================

export async function createUserAccount(user: INewUser) {
    try {
        const account = await axios.post(`users/signup`, user)
        return account
    } catch (error: any) {
        if (error.response) {
            return { error: error.response.data, status: error.response.status };
        } else if (error.request) {
            return { error: 'No response from the server', status: 500 };
        } else {
            return { error: 'An unexpected error occurred', status: 500 };
        }
    }
}

export async function signInAccount(user: { email: string; password: string }) {
    try {
        const session = await axios.post(`users/login`, user);
        return session;
    } catch (error: any) {
        if (error.response) {
            return { error: error.response.data, status: error.response.status };
        } else if (error.request) {
            return { error: 'No response from the server', status: 500 };
        } else {
            return { error: 'An unexpected error occurred', status: 500 };
        }
    }
}

export async function signOutAccount() {
    try {
        const response = await axios.get('users/logout')
        return response
    } catch (error) {
        console.log(error);
    }
}