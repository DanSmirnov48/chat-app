import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { createMessage, getMessagesByChatId, updateMessageStatus } from "@/lib/backend-api/messages";
import { IMessage, INewMessageBase, MessageStatus } from "@/types";

// ============================================================
// CHAT QUERIES
// ============================================================
export const useGetMessagesByChatId = ({ chatId }: { chatId: string }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_MESSAGES_BY_CHATID, chatId],
        queryFn: () => getMessagesByChatId({ chatId }),
        enabled: !!chatId,
    });
};

export const useCreateNewMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (message: INewMessageBase) => createMessage(message),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: (response) => {
            if (response.status === 201) {
                //@ts-ignore
                const chatId = response.data.chatId
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.GET_MESSAGES_BY_CHATID, chatId],
                });
            } else {
                console.log(response);
            }
        },
    });
};

export const updateChatMessages = (chatId: string, newMessage: IMessage) => {
    const queryClient = useQueryClient();
    queryClient.setQueryData<IMessage[]>([QUERY_KEYS.GET_MESSAGES_BY_CHATID, chatId], (prevData) => {
        const previousMessages = prevData as IMessage[];
        return [...previousMessages, newMessage];
    });
};

export const useUpdateMessageStatus = () => {
    return useMutation({
        mutationFn: (data: { messageId: IMessage['id'], newStatus: MessageStatus }) => updateMessageStatus(data),
    });
};