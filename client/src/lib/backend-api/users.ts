import { INewUser } from "@/types";
import axios from "axios";

// ============================================================
// USER
// ============================================================

export async function createUserAccount(user: INewUser) {
    try {
        const account = await axios.post(`/api/users/signup`, user)
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
        const session = await axios.post(`/api/users/login`, user);
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

export async function getUserSession() {
    try {
        const response = await axios.get('/api/users/validate');
        return response;
    } catch (error: any) {
        if (error.response.data === 'Unauthorized' && error.response.status === 401) {
            console.log('Unauthorized')
        }
        return undefined
    }
}

export async function signOutAccount() {
    try {
        const response = await axios.get('/api/users/logout')
        return response
    } catch (error) {
        console.log(error);
    }
}

export async function getAllUsers() {
    try {
        const response = await axios.get('/api/users')
        return response
    } catch (error) {
        console.log(error);
    }
}