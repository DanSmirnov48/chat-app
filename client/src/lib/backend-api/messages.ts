import axios from "axios";

// ============================================================
// CHATS
// ============================================================

export async function getMessagesByChatId({ chatId }: { chatId: string }) {
    try {
        const response = await axios.get(`/api/messages/${chatId}`);
        return response;
    } catch (error: any) {
        if (error.response.data === 'Unauthorized' && error.response.status === 401) {
            console.log('Unauthorized')
        }
        return undefined
    }
}