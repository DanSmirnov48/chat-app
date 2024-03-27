import { getUserChats } from "@/lib/backend-api/chats";
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