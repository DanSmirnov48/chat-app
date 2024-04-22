import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { createMessage, deleteMessage, getMessagesByChatId, updateMessageStatus } from "@/lib/backend-api/messages";
import { IMessage, INewMessageBase, MessageStatus } from "@/types";

// ============================================================
// CHAT QUERIES
// ============================================================

interface ICachedMessagesData {
    data: IMessage[];
    status: number;
    statusText: string;
}
export const useGetMessagesByChatId = ({ chatId }: { chatId: string }) => {
    return useQuery<ICachedMessagesData | undefined, Error, ICachedMessagesData>({
        queryKey: [QUERY_KEYS.GET_MESSAGES_BY_CHATID, chatId],
        queryFn: () => getMessagesByChatId({ chatId }),
        enabled: !!chatId,
        select: (data) => data ?? defaultCachedMessagesData,
    });
};

const defaultCachedMessagesData: ICachedMessagesData = {
    data: [],
    status: 200,
    statusText: 'OK',
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
                const chatId = response.data.chatId; const newMessage = response.data;
                updateCachedMessages(queryClient, chatId, newMessage);
            } else {
                console.log(response);
            }
        },
    });
};

export const updateCachedMessages = (queryClient: QueryClient, chatId: string, newMessage: IMessage) => {
    queryClient.setQueryData<ICachedMessagesData>(
        [QUERY_KEYS.GET_MESSAGES_BY_CHATID, chatId],
        (oldData: any) => {
            if (oldData) {
                return {
                    ...oldData,
                    data: [...oldData.data, newMessage],
                };
            } else {
                return {
                    data: [newMessage],
                    status: 200,
                    statusText: 'OK',
                };
            }
        }
    );
};

export const removeCachedMessage = (
    queryClient: QueryClient,
    chatId: string,
    messageId: string
) => {
    queryClient.setQueryData<ICachedMessagesData>(
        [QUERY_KEYS.GET_MESSAGES_BY_CHATID, chatId],
        (oldData) => {
            if (oldData) {
                const updatedData = oldData.data.filter((message) => message.id !== messageId);

                return {
                    ...oldData,
                    data: updatedData,
                };
            } else {
                return oldData;
            }
        }
    );
};

export const useUpdateMessageStatus = () => {
    return useMutation({
        mutationFn: (data: { messageId: IMessage['id'], newStatus: MessageStatus }) => updateMessageStatus(data),
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: IMessage['id']) => deleteMessage(id),
        onSuccess: (response, messageId) => {
            if (response && response.status === 200) {
                //@ts-ignore
                const chatId = response.data.chatId;
                removeCachedMessage(queryClient, chatId, messageId);
            }
        },
    });
};