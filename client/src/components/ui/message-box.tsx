import React, { forwardRef } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { IMessage, MessageStatus } from "@/types";
import { format } from "date-fns";
import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Check, CheckCheck } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDeleteMessage, useGetMessagesByChatId } from "@/lib/react-query/queries/messages";
import { useGetChatsByUserId } from "@/lib/react-query/queries/chat";
import { useChatStore } from "@/hooks/useChat";
import { useUserContext } from "@/context/AuthContext";

const messageBoxVariants = cva("py-2 px-3 z-99", {
    variants: {
        align: {
            self: "col-start-4 col-end-13 p-0",
            other: "col-start-1 col-end-10 p-0",
        },
        avatar: {
            self: "flex items-center justify-start flex-row-reverse",
            other: "flex flex-row items-center",
        },
        textStyle: {
            self: "relative mr-3 bg-indigo-100 before:content-[''] before:absolute before:w-4 before:h-4 before:bg-indigo-100 before:rotate-45 before:-right-1.5 before:top-1/2 before:-translate-y-1/2",
            other: "relative ml-3 bg-white before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rotate-45 before:-left-1.5 before:top-1/2 before:-translate-y-1/2",
        },
    },
});

interface MessageBoxProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageBoxVariants> {
    message: IMessage
    isSelf: boolean;
}

const MessageBox = forwardRef<HTMLDivElement, MessageBoxProps>(({ className, message, isSelf, ...props }, ref) => {
    const formattedTime = format(new Date(message.createdAt), "HH:mm");
    const fullDate = format(new Date(message.createdAt), "dd/MM/yyyy HH:mm");

    const { mutateAsync: deleteMessage } = useDeleteMessage()

    const { user } = useUserContext();
    const { selectedChatId } = useChatStore();
    const { refetch: refetchChats } = useGetChatsByUserId({ userId: user.id })
    const { refetch: refetchMessages } = useGetMessagesByChatId({ chatId: selectedChatId ?? '' });

    async function handleDeleteMessage(message: IMessage) {
        const res = await deleteMessage(message.id)
        if (res.status === 200) {
            selectedChatId && refetchMessages();
            refetchChats();
        }
    }

    return (
        <div className={cn(messageBoxVariants({ align: isSelf ? "self" : "other", ...props }), className)} ref={ref}{...props}>
            <div className={messageBoxVariants({ avatar: isSelf ? "self" : "other" })}>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <div className={cn("relative text-sm py-2 px-4 shadow rounded-lg max-w-xs", messageBoxVariants({ textStyle: isSelf ? "self" : "other" }))} >
                            <div className="mb-1 mr-14">{message.content}</div>
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="absolute bottom-1.5 right-1.5 text-[0.65rem] leading-3">
                                            <div className="flex items-center">
                                                {formattedTime}
                                                {isSelf && message.status === MessageStatus.SENDING && <Check className="w-[14px] h-[14px] ml-1 text-gray-600" />}
                                                {isSelf && message.status === MessageStatus.SENT && <Check className="w-[14px] h-[14px] ml-1 text-green-600" />}
                                                {isSelf && message.status === MessageStatus.DELIVERED && <CheckCheck className="w-[14px] h-[14px] ml-1 text-gray-600" />}
                                                {isSelf && message.status === MessageStatus.READ && <CheckCheck className="w-[14px] h-[14px] ml-1 text-green-600" />}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">{fullDate}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                        <ContextMenuItem inset>
                            Back
                            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem inset disabled>
                            Forward
                            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem inset onClick={() => handleDeleteMessage(message)}>
                            Delete Message
                            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                                <ContextMenuItem>
                                    Save Page As...
                                    <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
                                </ContextMenuItem>
                                <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                                <ContextMenuItem>Name Window...</ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem>Developer Tools</ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                        <ContextMenuCheckboxItem checked>
                            Show Bookmarks Bar
                            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
                        </ContextMenuCheckboxItem>
                        <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
                    </ContextMenuContent>
                </ContextMenu>
            </div>
        </div>
    );
});

MessageBox.displayName = "MessageBox";

export { MessageBox, messageBoxVariants };