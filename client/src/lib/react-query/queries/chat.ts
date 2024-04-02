import { createChat, getChatById, getUserChats } from "@/lib/backend-api/chats";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { useUserContext } from "@/context/AuthContext";

// ============================================================
// CHAT QUERIES
// ============================================================
export const useGetChatsByUserId = ({ userId }: { userId: string }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CHATS_BY_USERID, userId],
        queryFn: () => getUserChats({ userId }),
        enabled: !!userId,
    });
};

export const useGetChatByChatId = ({ chatId }: { chatId: string }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CHAT_BY_ID, chatId],
        queryFn: () => getChatById({ chatId }),
        enabled: !!chatId,
    });
};

export const useCreateNewChat = () => {
    const queryClient = useQueryClient();
    const { user } = useUserContext();

    return useMutation({
        mutationFn: (userIds: { user1Id: string; user2Id: string }) =>
            createChat(userIds),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: (response) => {
            if (response.status === 201 && user) {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.GET_CHATS_BY_USERID, user.id],
                });
            } else {
                console.log(response);
            }
        },
    });
};
