import { useEffect } from 'react';
import { io } from 'socket.io-client'
import { Shell } from '@/components/shell'
import Chatbox from '@/components/chatbox';
import { useChatStore } from '@/hooks/useChat';
import ChatSidebar from '@/components/chatSidebar';
import { useUserContext } from '@/context/AuthContext'
import { useNotificationStore } from '@/hooks/useNotifications';
import { getMessage, INotification, MessageStatus } from '@/types'
import { useGetChatsByUserId } from '@/lib/react-query/queries/chat';
import { useGetMessagesByChatId, useUpdateMessageStatus } from '@/lib/react-query/queries/messages';

const home = () => {
  const { user, isAuthenticated } = useUserContext();
  const { addNotification } = useNotificationStore();
  const { selectedChatId, socket, recipient, setOnlineUsers, setSocket } = useChatStore();
  const { refetch: refetchChats } = useGetChatsByUserId({ userId: user.id })
  const { refetch: refetchMessages } = useGetMessagesByChatId({ chatId: selectedChatId ?? '' });
  const { mutateAsync: updateMessageStatus } = useUpdateMessageStatus()

  useEffect(() => {
    if (isAuthenticated && !socket) {
      const newSocket = io("http://localhost:3000")
      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (socket && isAuthenticated) {
      // Listen for "addNewUser" event
      socket.emit("addNewUser", user.id);
      socket.on("getOnlineUsers", (res) => {
        setOnlineUsers(res);
      });

      // Clean up event listeners
      return () => { socket.off("getOnlineUsers") };
    }
  }, [socket, isAuthenticated, selectedChatId]);

  useEffect(() => {
    if (socket && isAuthenticated) {
      // Listen for "getNotification" event
      socket.on("getNotification", async (res: INotification) => {
        console.log(`Recieving 'getNotification' Socket event: ${res}`)
        if (res.chatId === selectedChatId) {
          addNotification({ ...res, isRead: true });
          selectedChatId && refetchMessages();
        } else {
          addNotification(res);
          new Audio('/notification-2870.wav').play();
        }
        refetchChats();
      });

      // Clean up event listeners
      return () => { socket.off("getNotification") };
    }
  }, [socket, isAuthenticated, selectedChatId]);

  useEffect(() => {
    if (socket) {
      // Listen for "getMessage" event
      socket.on("getMessage", async (res: getMessage) => {
        console.log(`Recieving 'getMessage' Socket event: ${res}`)
        if (res.chatId === selectedChatId) {
          await updateMessageStatus({
            messageId: res.messageId,
            newStatus: MessageStatus.READ
          })

          let newStatus = MessageStatus.READ as String
          let messageId = res.messageId
          let recipientId = res.senderId
          socket.emit("sendMessageStatusUpdate", { messageId, recipientId, newStatus })

          selectedChatId && refetchMessages();
        } else {
          await updateMessageStatus({
            messageId: res.messageId,
            newStatus: MessageStatus.DELIVERED
          })

          let newStatus = MessageStatus.DELIVERED as String
          let messageId = res.messageId
          let recipientId = res.senderId
          socket.emit("sendMessageStatusUpdate", { messageId, recipientId, newStatus })
        }
        refetchChats();
      });

      return () => { socket.off("getMessage") };
    }
  }, [socket, selectedChatId]);

  useEffect(() => {
    if (socket) {
      // Listen for "messageStatusUpdated" event
      socket.on("getMessageStatusUpdate", async (res) => {
        console.log("Recieving 'getMessageStatusUpdate' Socket event: ", res)
        selectedChatId && refetchMessages();
        refetchChats();
      });

      return () => { socket.off("getMessageStatusUpdate") };
    }
  }, [socket, selectedChatId]);

  return (
    <Shell variant={"markdown"}>
      <div className="flex h-full gap-2">
        <ChatSidebar />
        {(selectedChatId && socket && recipient) ? <Chatbox /> :
          <div className="flex-1 rounded-lg bg-accent lg:col-span-2">
            <div className="flex flex-col w-full h-full items-center justify-center antialiased text-gray-800 overflow-x-hidden">
              <div className='flex flex-row items-center justify-center mb-2'>
                <img src="/logo.ico" alt="" className="w-10 mr-2" />
                <div className="font-bold text-2xl">ChatApp</div>
              </div>
              <p>Select a contact from your active conversations to start chatting.</p>
            </div>
          </div>
        }
      </div>
    </Shell>
  );
};
export default home