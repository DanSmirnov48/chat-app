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

export async function createChat(userIds: { user1Id: string, user2Id: string }) {
    try {
        const response = await axios.post(`/api/chats`, userIds);
        return response;
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

export async function getChatById({ chatId }: { chatId: string }) {
    try {
        const response = await axios.get(`/api/chats/findById/${chatId}`);
        return response;
    } catch (error: any) {
        if (error.response.data === 'Unauthorized' && error.response.status === 401) {
            console.log('Unauthorized')
        }
        return undefined
    }
}
