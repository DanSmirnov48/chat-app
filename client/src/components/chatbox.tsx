import * as z from "zod";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useForm } from "react-hook-form";
import { Send, Smile } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from '@/context/AuthContext'
import { NewMessageValidation } from "@/lib/validation";
import { MessageBox } from '@/components/ui/message-box';
import { IChatWithUser, IMessage, INewMessage, IUser } from '@/types'
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCreateNewMessage, useGetMessagesByChatId } from '@/lib/react-query/queries/messages';
import { Socket } from 'socket.io-client'
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarImage } from "./ui/avatar";

interface ChatboxProps {
    chatId: IChatWithUser['id'],
    socket: Socket,
    recipient: IUser
}

const Chatbox = ({ chatId, socket, recipient }: ChatboxProps) => {
    const { user } = useUserContext();
    const { data: getMessages, isLoading: chatMessagesLoading } = useGetMessagesByChatId({ chatId: chatId });
    const { mutateAsync: createNewMessage } = useCreateNewMessage()

    const form = useForm<z.infer<typeof NewMessageValidation>>({
        resolver: zodResolver(NewMessageValidation),
        defaultValues: {
            content: "",
        },
    });

    const handleSendMessage = async (message: z.infer<typeof NewMessageValidation>) => {
        const newMessage: INewMessage = {
            chatId,
            senderId: user.id,
            content: message.content
        }

        const res = await createNewMessage(newMessage)
        if (res && res.status === 201) {
            form.reset()
        } else {
            console.log(res)
        }
    };

    return (
        <div className="flex-1 rounded-lg bg-accent lg:col-span-2">
            <div className="flex flex-col h-full antialiased text-gray-800 overflow-hidden">
                <div className="flex flex-row items-center w-full bg-indigo-100 border rounded-t-lg p-1.5">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={"/avatar.png"} />
                    </Avatar>
                    <div className='flex flex-col w-full'>
                        <h2 className="ml-2 text-sm font-semibold">{recipient.name}</h2>
                        <h2 className="ml-2 text-xs text-left">last see today at 15:15</h2>
                    </div>
                </div>
                <ScrollArea className="h-[60vh] w-full">
                    <div className="p-4">
                        {(!chatMessagesLoading && getMessages) && getMessages.data.map((message: IMessage) => (
                            <MessageBox key={message.id} message={message} isSelf={message.senderId === user.id} />
                        ))}
                    </div>
                </ScrollArea>
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
                                                <div className="relative w-full">
                                                    <Input
                                                        type="text"
                                                        placeholder="Type a message"
                                                        className="px-4 py-2 h-12"
                                                        {...field}

                                                    />
                                                    <Smile className='w-6 h-6 cursor-pointer absolute flex items-center justify-center right-3 top-3 text-gray-400 hover:text-gray-600' />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="flex-shrink-0 h-12">
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