import { MessageBox } from '@/components/ui/message-box';
import { useUserContext } from '@/context/AuthContext'
import { useGetMessagesByChatId } from '@/lib/react-query/queries/messages';
import { IChatWithUser, IMessage } from '@/types'
import { Paperclip, Send, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Chatbox = ({ chatId }: { chatId: IChatWithUser['id'] }) => {
    const { user } = useUserContext();
    const { data: getMessages, isLoading: chatMessagesLoading } = useGetMessagesByChatId({ chatId: chatId });

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
                    <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                        <Paperclip className='w-6 h-6 cursor-pointer' />
                        <div className="flex-grow ml-4">
                            <div className="relative w-full">
                                <Input type='text' />
                                <Smile className='w-6 h-6 cursor-pointer absolute flex items-center justify-center right-2 top-2 text-gray-400 hover:text-gray-600' />
                            </div>
                        </div>
                        <Button className='ml-4 rounded-xl text-base'>
                            Send
                            <Send className='w-5 h-5 ml-2' />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chatbox