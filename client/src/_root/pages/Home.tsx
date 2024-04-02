import Chatbox from '@/components/chatbox';
import { Shell } from '@/components/shell'
import { useUserContext } from '@/context/AuthContext'
import { useGetAllUsers } from '@/lib/react-query/queries/auth';
import { useCreateNewChat, useGetChatsByUserId } from '@/lib/react-query/queries/chat'
import { IChatWithMessages, IChatWithUser, IUser } from '@/types'
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client'
import { format, isToday } from 'date-fns';

const NoChatSelectedWindow = () => {
  return (
    <div className="flex-1 rounded-lg bg-accent lg:col-span-2">
      <div className="flex flex-col h-full antialiased text-gray-800 overflow-x-hidden">
      </div>
    </div>
  );
};

const home = () => {
  const [selectedChatId, setSelectedChatId] = useState<IChatWithUser['id'] | null>(null);
  const [recipient, setRecipient] = useState<IUser | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  const { user, isAuthenticated } = useUserContext();
  const { mutateAsync: createNewChat } = useCreateNewChat()
  const { data: allUSers, isLoading: allUsersLoading } = useGetAllUsers()
  const { data: getUserChats, isLoading: userChatsLoading } = useGetChatsByUserId({ userId: user.id })

  console.log({ onlineUsers })

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io("http://localhost:3000")
      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [user])

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

  const pChats = allUSers?.data.users.filter((u: IUser) => {
    let isChatCreaterd = false

    if (user.id === u.id) return false

    if (getUserChats?.data) {
      isChatCreaterd = getUserChats.data.some((chat: IChatWithUser) => {
        return chat.users[0].id === u.id || chat.users[1].id === u.id
      })
    }
    return !isChatCreaterd
  })

  async function handleCreateNewChat(newUser: IUser['id']) {
    const res = await createNewChat({
      user1Id: user.id,
      user2Id: newUser
    })
    console.log(res)
  }

  const userProfile = () => {
    return (
      <div className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
        <div className="h-20 w-20 rounded-full border overflow-hidden">
          <img
            src="https://avatars3.githubusercontent.com/u/2763884?s=128"
            alt="Avatar"
            className="h-full w-full"
          />
        </div>
        <div className="text-sm font-semibold mt-2">Aminos Co.</div>
        <div className="text-xs text-gray-500">Lead UI/UX Designer</div>
        <div className="flex flex-row items-center mt-3">
          <div className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full">
            <div className="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
          </div>
          <div className="leading-none ml-1 text-xs">Active</div>
        </div>
      </div>
    )
  }

  const banner = () => {
    return (
      <div className="flex flex-row items-center justify-center h-12 w-full">
        <div
          className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            ></path>
          </svg>
        </div>
        <div className="ml-2 font-bold text-2xl">QuickChat</div>
      </div>
    )
  }

  const sidebar = () => {
    return (
      <div className="flex-none w-1/3 rounded-lg bg-accent">
        <div className="flex flex-col h-full antialiased text-gray-800">
          <div className="flex flex-row h-full overflow-x-hidden">
            <div className="flex flex-col py-8 px-6 w-full flex-shrink-0">
              {banner()}
              {userProfile()}
              <div className="flex flex-col flex-1 mt-8">
                <div className="flex flex-row items-center justify-between text-xs">
                  <span className="font-bold">Active Conversations</span>
                  <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">{!userChatsLoading && getUserChats?.data.length}</span>
                </div>
                <div className="flex flex-col space-y-1 mt-4 -mx-2 overflow-y-auto">
                  {getUserChats?.data.map((chat: IChatWithMessages) => {
                    const recepient = chat.users.find((u) => u.id !== user.id);

                    if (!recepient) return null;

                    let formattedDate = '';
                    let content = '';

                    if (chat.Message.length > 0) {
                      const latestMessage = chat.Message[chat.Message.length - 1];
                      const formattedCreatedAt = format(new Date(latestMessage.createdAt), 'dd/MM/yyyy');
                      const messageDate = new Date(latestMessage.createdAt);
                      const isTodayMessage = isToday(messageDate);

                      formattedDate = isTodayMessage ? `Today at ${format(messageDate, 'HH:mm')}` : formattedCreatedAt;
                      content = latestMessage.content;
                    }

                    return (
                      <div key={recepient.id}>
                        <button onClick={() => { setSelectedChatId(chat.id), setRecipient(recepient) }} className="flex flex-row items-center w-full hover:bg-gray-200 rounded-xl p-2">
                          <Avatar className="h-[50px] w-[50px]">
                            <AvatarImage src={"/avatar.png"} />
                          </Avatar>
                          <div className='flex flex-col w-full h-[43px]'>
                            <div className="flex flex-col h-full">
                              <div className='flex flex-row w-full items-center justify-between'>
                                <h2 className="ml-2 text-sm font-semibold">{recepient.name}</h2>
                                {formattedDate && <h2 className="text-xs">{formattedDate}</h2>}
                              </div>
                              <div className='ml-2 text-sm text-left mt-auto max-w-44'>
                                <h2 className="text-xs truncate">{content}</h2>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <>
                  <div className="flex flex-row items-center justify-between text-xs mt-5">
                    <span className="font-bold">Potential Conversations</span>
                    <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">{!allUsersLoading && pChats.length}</span>
                  </div>
                  <div className="flex flex-col space-y-1 mt-4 -mx-2 overflow-y-auto">
                    {!allUsersLoading && pChats.map((u: IUser) => {
                      //@ts-ignore
                      const isOnline = onlineUsers.some((user) => user?.userId === u.id)
                      return (
                        <div key={u.id} className="relative">
                          <button onClick={() => handleCreateNewChat(u.id)} className="flex flex-row items-center w-full hover:bg-gray-200 rounded-xl p-2">
                            <div className="flex items-center justify-center relative h-8 w-8 bg-purple-200 rounded-full">
                              J
                              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'} absolute top-0 right-0 border border-white`}></div>
                            </div>
                            <div className="ml-2 text-sm font-semibold">{u.name}</div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  };

  return (
    <Shell variant={'markdown'}>
      <div className="flex h-full gap-2">
        {sidebar()}
        {(selectedChatId && socket && recipient) ? <Chatbox chatId={selectedChatId} socket={socket} recipient={recipient} /> : <NoChatSelectedWindow />}
      </div>
    </Shell>
  );
};
export default home