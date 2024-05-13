import * as z from "zod";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useForm } from "react-hook-form";
import { Loader2, Paperclip, Send, Smile, X } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from '@/context/AuthContext'
import { NewMessageValidation } from "@/lib/validation";
import { MessageBox } from '@/components/ui/message-box';
import { IMessage, INewMessageBase } from '@/types'
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCreateNewMessage, useGetMessagesByChatId } from '@/lib/react-query/queries/messages';
import { useGetChatsByUserId } from "@/lib/react-query/queries/chat";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useChatStore } from "@/hooks/useChat";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import InputEmoji from "react-input-emoji";
import { useDropzone } from "@uploadthing/react/hooks";
import { FileWithPath } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/utils/uploadthing";
import { useCallback, useState } from 'react';

const convertFileToUrl = (file: File) => URL.createObjectURL(file);

const Chatbox = () => {
    const { selectedChatId, socket, recipient, onlineUsers, setSelectedChatId } = useChatStore();

    const { user } = useUserContext();
    const { mutateAsync: createNewMessage } = useCreateNewMessage()
    const { refetch: refetchChats } = useGetChatsByUserId({ userId: user.id })
    const { data: getMessages, isLoading: chatMessagesLoading } = useGetMessagesByChatId({ chatId: selectedChatId ?? "" });

    const [file, setFile] = useState<FileWithPath[]>([]);
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const isOnline = onlineUsers.find((u) => u.userId === recipient!.id);

    // !chatMessagesLoading && console.log(getMessages)

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        const newFile = [...acceptedFiles];
        const newFileUrls = newFile.map(convertFileToUrl);

        setFile(newFile);
        setFileUrl(newFileUrls[0]);
    }, [file]);

    const { startUpload, isUploading, permittedFileInfo, } = useUploadThing("imageUploader", {
        onClientUploadComplete: (data) => { console.log(data) },
        onUploadError: (error: Error) => { console.log(error) },
        onUploadBegin: (fileName: string) => { console.log("upload started for ", fileName) },
        onUploadProgress: (progress: number) => setUploadProgress(progress),
    });

    const fileTypes = permittedFileInfo?.config ? Object.keys(permittedFileInfo?.config) : [];

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
        maxFiles: 1
    });


    const form = useForm<z.infer<typeof NewMessageValidation>>({
        resolver: zodResolver(NewMessageValidation),
        defaultValues: {
            content: "",
            image: undefined,
        },
    });

    const handleSendMessage = async (message: z.infer<typeof NewMessageValidation>) => {
        if (selectedChatId && socket) {
            const newMessage: INewMessageBase = {
                chatId: selectedChatId,
                senderId: user.id,
                content: message.content,
            }

            if (file.length > 0) {
                const UploadFileResponse = await startUpload(file)
                const { key, name, url } = UploadFileResponse![0]
                newMessage.image = { key, name, url }

                handleRemoveNewFile()
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

    function handleRemoveNewFile() {
        setFileUrl(undefined);
        setFile([]);
    }

    return (
        <div className="flex-1 rounded-lg bg-accent lg:col-span-2">
            <div className="flex flex-col h-full antialiased text-gray-800 overflow-hidden">
                <div className="flex flex-row items-center w-full bg-indigo-100 border rounded-t-lg p-1.5">
                    <div className='relative'>
                        <Avatar className="h-10 w-10 border-4">
                            <AvatarImage
                                src={recipient?.image?.url}
                                alt={user.email}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-3xl font-semibold">{user.name.slice(0, 1)}</AvatarFallback>
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

                {fileUrl &&
                    <div className="w-full border-t-4">
                        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4  p-4">
                            <div className="relative">
                                <img
                                    src={fileUrl}
                                    className="h-48 lg:h-[200px] w-full rounded-lg object-scale-down border-4 border-dashed p-5"
                                />
                                <X className="absolute top-2 right-2 cursor-pointer" onClick={handleRemoveNewFile} />
                            </div>
                        </div>
                    </div>
                }

                <div className="m-2">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSendMessage)}
                            className="flex flex-col items-center sm:flex-row"
                        >

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem className="flex">
                                        <FormControl>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} className="cursor-pointer" />
                                                <Button type="button" size={"icon"} variant={"ghost"}><Paperclip /></Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="shad-form_message" />
                                    </FormItem>
                                )}
                            />

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
                                {isUploading ? <><Loader2 className="animate-spin h-5 w-5 mr-3" />Upoading...</> : <>Send<Send className='w-5 h-5 ml-2' /></>}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default Chatbox