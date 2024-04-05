import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client'
import { IChatWithUser, INotification, IUser } from '@/types'
import { Shell } from '@/components/shell'
import Chatbox from '@/components/chatbox';
import ChatSidebar from '@/components/chatSidebar';
import { useUserContext } from '@/context/AuthContext'
import { useNotificationStore } from '@/hooks/useNotifications';

const home = () => {
  const { user, isAuthenticated } = useUserContext();

  const [selectedChatId, setSelectedChatId] = useState<IChatWithUser['id'] | null>(null);
  const [recipient, setRecipient] = useState<IUser | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  const { notifications, addNotification } = useNotificationStore();
  console.log({ notifications })

  console.log({ onlineUsers })

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
      socket.emit("addNewUser", user.id)
      socket.on("getOnlineUsers", (res) => {
        setOnlineUsers(res)
      })

      return () => {
        socket.off("getOnlineUsers");
      }
    }
  }, [socket])

  useEffect(() => {
    if (isAuthenticated && socket) {
      socket.on("getNotification", (res: INotification) => {
        if (res.chatId === selectedChatId) {
          // The chat is open, mark the notification as read
          console.log({ ...res });
          addNotification({ ...res, isRead: true });
        } else {
          // The chat is not open, add the notification without marking it as read
          console.log({ ...res });
          addNotification(res);
        }
      });

      return () => {
        socket.off("getNotification");
      }
    }
  }, [socket])

  return (
    <Shell variant={"markdown"}>
      <div className="flex h-full gap-2">
        {sidebar()}
        {selectedChatId && socket && recipient ? (
          <Chatbox
            chatId={selectedChatId}
            socket={socket}
            recipient={recipient}
          />
        ) : (
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