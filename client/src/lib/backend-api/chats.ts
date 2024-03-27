import axios from "axios";

// ============================================================
// CHATS
// ============================================================

export async function getUserChats({ userId }: { userId: string }) {
    try {
        const response = await axios.get(`/api/chats/${userId}`);
        return response;
    } catch (error: any) {
        if (error.response.data === 'Unauthorized' && error.response.status === 401) {
            console.log('Unauthorized')
        }
        return undefined
    }
}