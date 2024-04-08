import { format, isToday } from 'date-fns';
import { useChatStore } from '@/hooks/useChat';
import { Check, CheckCheck } from "lucide-react";
import { useUserContext } from '@/context/AuthContext'
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useGetAllUsers } from '@/lib/react-query/queries/auth';
import { IChatWithMessages, IChatWithUser, IUser, MessageStatus } from '@/types'
import { useCreateNewChat, useGetChatsByUserId } from '@/lib/react-query/queries/chat'

export default function ChatSidebar() {
    const { user } = useUserContext();
    const { mutateAsync: createNewChat } = useCreateNewChat()
    const { data: allUSers, isLoading: allUsersLoading } = useGetAllUsers()
    const { onlineUsers, setSelectedChatId, setRecipient } = useChatStore();
    const { data: getUserChats, isLoading: userChatsLoading } = useGetChatsByUserId({ userId: user.id })

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

    return (
        <div className="flex-none w-1/3 rounded-lg bg-accent">
            <div className="flex flex-col h-full antialiased text-gray-800">
                <div className="flex flex-row h-full overflow-x-hidden">
                    <div className="flex flex-col py-8 px-6 w-full flex-shrink-0">
                        {/* Logo */}
                        <div className="flex flex-row items-center justify-center h-12 w-full">
                            <img src="/logo.ico" alt="" className="w-10 mr-2" />
                            <div className="ml-2 font-bold text-2xl">ChatApp</div>
                        </div>
                        {/*  User Profile */}
                        <div className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
                            <div className="h-20 w-20 rounded-full border overflow-hidden">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={"/avatar.png"} />
                                </Avatar>
                            </div>
                            <div className="text-sm font-semibold mt-2">{user.name}</div>
                            <div className="text-xs text-gray-500">Lead UI/UX Designer</div>
                            <div className="flex flex-row items-center mt-3">
                                <div className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full">
                                    <div className="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
                                </div>
                                <div className="leading-none ml-1 text-xs">Active</div>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 mt-8">
                            <div className="flex flex-row items-center justify-between text-xs">
                                <span className="font-bold">Active Conversations</span>
                                <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">{!userChatsLoading && getUserChats?.data.length}</span>
                            </div>
                            <div className="flex flex-col space-y-1 mt-4 -mx-2 overflow-y-auto">
                                {getUserChats?.data.map((chat: IChatWithMessages) => {
                                    const recepient = chat.users.find((u) => u.id !== user.id);

                                    if (!recepient) return null;

                                    const isOnline = onlineUsers.find((u) => u.userId === recepient.id);

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

                                    const latestMessage = chat.Message[chat.Message.length - 1];
                                    const isSelf = latestMessage && latestMessage.senderId === user.id;

                                    return (
                                        <div key={recepient.id}>
                                            <button onClick={() => { setSelectedChatId(chat.id), setRecipient(recepient) }} className="flex flex-row items-center w-full hover:bg-gray-200 rounded-xl p-2">
                                                <div className='relative'>
                                                    <Avatar className="h-[50px] w-[50px]">
                                                        <AvatarImage src={"/avatar.png"} />
                                                    </Avatar>
                                                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'} absolute top-1 right-1 border border-accent`}></div>
                                                </div>
                                                <div className='flex flex-col w-full h-[43px]'>
                                                    <div className="flex flex-col h-full">
                                                        <div className='flex flex-row w-full items-center justify-between'>
                                                            <h2 className="ml-2 text-sm font-semibold">{recepient.name}</h2>
                                                            {formattedDate && <h2 className="text-xs">{formattedDate}</h2>}
                                                        </div>
                                                        <div className='flex items-center ml-2 text-sm text-left mt-auto max-w-44'>
                                                            {isSelf && latestMessage.status === MessageStatus.SENDING && <Check className="w-[14px] h-[14px] ml-1 text-gray-600" />}
                                                            {isSelf && latestMessage.status === MessageStatus.SENT && <Check className="w-[14px] h-[14px] ml-1 text-green-600" />}
                                                            {isSelf && latestMessage.status === MessageStatus.DELIVERED && <CheckCheck className="w-[14px] h-[14px] ml-1 text-gray-600" />}
                                                            {isSelf && latestMessage.status === MessageStatus.READ && <CheckCheck className="w-[14px] h-[14px] ml-1 text-green-600" />}
                                                            <h2 className={`text-sm truncate ${isSelf ? 'ml-1' : ''}`}>{content}</h2>
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
                                        const isOnline = onlineUsers.some((user) => user.userId === u.id)
                                        return (
                                            <div key={u.id} className="relative">
                                                <button onClick={() => handleCreateNewChat(u.id)} className="flex flex-row items-center w-full hover:bg-gray-200 rounded-xl p-2">
                                                    <div className='relative'>
                                                        <Avatar className="h-[50px] w-[50px]">
                                                            <AvatarImage src={"/avatar.png"} />
                                                        </Avatar>
                                                        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'} absolute top-1 right-1 border border-white`}></div>
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
}