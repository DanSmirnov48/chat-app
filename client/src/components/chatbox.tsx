import * as z from "zod";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useForm } from "react-hook-form";
import { Send, Smile } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from '@/context/AuthContext'
import { NewMessageValidation } from "@/lib/validation";
import { MessageBox } from '@/components/ui/message-box';
import { IChatWithUser, IMessage, INewMessage } from '@/types'
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCreateNewMessage, useGetMessagesByChatId } from '@/lib/react-query/queries/messages';

const Chatbox = ({ chatId }: { chatId: IChatWithUser['id'] }) => {
    const { user } = useUserContext();
    const { data: getMessages, isLoading: chatMessagesLoading } = useGetMessagesByChatId({ chatId: chatId });
    const { mutateAsync: createNewMessage } = useCreateNewMessage()

    const form = useForm<z.infer<typeof NewMessageValidation>>({
        resolver: zodResolver(NewMessageValidation),
        defaultValues: {
            content: "",
        },
    });

    const handleSignin = async (message: z.infer<typeof NewMessageValidation>) => {
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
            <div className="flex flex-col h-full antialiased text-gray-800 overflow-x-hidden">
                <div className="flex flex-col flex-auto p-4">
                    <div className="flex flex-col h-full overflow-x-auto mb-4">
                        <div className="grid grid-cols-12 gap-y-2">
                            {(!chatMessagesLoading && getMessages) && getMessages.data.map((message: IMessage) => (
                                <MessageBox key={message.id} text={message.content} isSelf={message.senderId === user.id} />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl bg-white p-4">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSignin)}
                                className="flex flex-col items-center sm:flex-row my-2"
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
                                                            placeholder="Share your thoughts..."
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
        </div>
    );
}

export default Chatbox