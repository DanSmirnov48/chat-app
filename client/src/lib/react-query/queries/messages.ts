import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { createMessage, getMessagesByChatId } from "@/lib/backend-api/messages";
import { INewMessage } from "@/types";

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
        mutationFn: (message: INewMessage) => createMessage(message),
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