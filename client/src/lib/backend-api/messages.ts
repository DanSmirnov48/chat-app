import { IMessage, INewMessageBase, MessageStatus } from "@/types";
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

export async function createMessage(newMessage: INewMessageBase) {
    try {
        const response = await axios.post(`/api/messages`, newMessage);
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

export async function updateMessageStatus(data: { messageId: IMessage['id'], newStatus: MessageStatus }) {
    try {
        const response = await axios.patch(`/api/messages/update-status`, data);
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