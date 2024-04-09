import * as z from "zod";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useForm } from "react-hook-form";
import { Send, Smile } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from '@/context/AuthContext'
import { NewMessageValidation } from "@/lib/validation";
import { MessageBox } from '@/components/ui/message-box';
import { IMessage, INewMessageBase } from '@/types'
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCreateNewMessage, useGetMessagesByChatId } from '@/lib/react-query/queries/messages';
import { useGetChatsByUserId } from "@/lib/react-query/queries/chat";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useChatStore } from "@/hooks/useChat";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import InputEmoji from "react-input-emoji";

const Chatbox = () => {
    const { selectedChatId, socket, recipient, onlineUsers, setSelectedChatId } = useChatStore();

    const { user } = useUserContext();
    const { mutateAsync: createNewMessage } = useCreateNewMessage()
    const { refetch: refetchChats } = useGetChatsByUserId({ userId: user.id })
    const { data: getMessages, isLoading: chatMessagesLoading } = useGetMessagesByChatId({ chatId: selectedChatId ?? "" });

    const isOnline = onlineUsers.find((u) => u.userId === recipient!.id);

    const form = useForm<z.infer<typeof NewMessageValidation>>({
        resolver: zodResolver(NewMessageValidation),
        defaultValues: {
            content: "",
        },
    });

    const handleSendMessage = async (message: z.infer<typeof NewMessageValidation>) => {
        if (selectedChatId && socket) {
            const newMessage: INewMessageBase = {
                chatId: selectedChatId,
                senderId: user.id,
                content: message.content,
            }

            const res = await createNewMessage(newMessage)
            console.log(res)
            if (res && res.status === 201) {
                form.reset()
                refetchChats() // update the chats list in the sidebar

                if (recipient && isOnline) {
                    //@ts-ignore
                    const messageId = res.data.id
                    const recipientId = recipient.id
                    console.log(`Sending 'sendMessage' Socket event to ${recipientId}`)
                    socket.emit("sendMessage", { ...newMessage, messageId, recipientId })
                }
            } else {
                console.log(res)
            }
        }
    };

    return (
        <div className="flex-1 rounded-lg bg-accent lg:col-span-2">
            <div className="flex flex-col h-full antialiased text-gray-800 overflow-hidden">
                <div className="flex flex-row items-center w-full bg-indigo-100 border rounded-t-lg p-1.5">
                    <div className='relative'>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={"/avatar.png"} />
                        </Avatar>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'} absolute top-1 right-1 border border-white`}></div>
                    </div>
                    <div className='flex flex-col w-full'>
                        <h2 className="ml-2 text-sm font-semibold">{recipient!.name}</h2>
                        <h2 className="ml-2 text-xs text-left">{isOnline ? "Online" : "last see today at 15:15"}</h2>
                    </div>
                </div>

                <ContextMenu>
                    <ContextMenuTrigger>
                        <ScrollArea className="h-[60vh] w-full">
                            <div className="p-4">
                                {(!chatMessagesLoading && getMessages) && getMessages.data.map((message: IMessage) => (
                                    <MessageBox key={message.id} message={message} isSelf={message.senderId === user.id} />
                                ))}
                            </div>
                        </ScrollArea>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-44">
                        <ContextMenuItem inset onClick={() => setSelectedChatId(null)}>
                            Close Chat
                            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                <div className="m-2">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSendMessage)}
                            className="flex flex-col items-center sm:flex-row"
                        >
                            <div className="flex flex-row items-center mb-4 sm:mb-0 w-full sm:mr-2">
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <InputEmoji
                                                    shouldReturn={false}
                                                    shouldConvertEmojiToImage={false}
                                                    placeholder="Type a message"
                                                    borderRadius={12}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="flex-shrink-0 h-10">
                                Send
                                <Send className='w-5 h-5 ml-2' />
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default Chatbox