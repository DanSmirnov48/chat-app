import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { useUserContext } from "@/context/AuthContext";
import { getMessagesByChatId } from "@/lib/backend-api/messages";

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