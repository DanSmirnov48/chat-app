import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bell, FileCheck, FileX, Navigation } from "lucide-react";
import { useNotificationStore } from "@/hooks/useNotifications";
import { useGetAllUsers } from "@/lib/react-query/queries/auth";
import { INotification, IUser, MessageStatus } from "@/types";
import { format, isToday } from "date-fns";
import { useState } from "react";
import { useUpdateMessageStatus } from "@/lib/react-query/queries/messages";
import { useChatStore } from "@/hooks/useChat";

export function UserNotification() {
    const { socket, setSelectedChatId, setRecipient } = useChatStore()
    const [open, setOpen] = useState(false)
    const { mutateAsync: updateMessageStatus } = useUpdateMessageStatus()
    const { data: allUsers, isLoading: allUsersLoading } = useGetAllUsers()
    const { notifications, markNotificationAsRead, clearNotifications, removeNotification } = useNotificationStore()

    // Filter unread notifications
    const unreadNotifications = notifications.filter((notification: INotification) => !notification.isRead);

    // Sort unread notifications by date in descending order
    const sortedNotifications = [...notifications].sort(
        (a: INotification, b: INotification) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const handleMarkAsRead = async (item: INotification) => {
        markNotificationAsRead(item.id)

        await updateMessageStatus({
            messageId: item.messageId,
            newStatus: MessageStatus.READ
        })

        if (socket) {
            const messageId = item.messageId
            const newStatus = MessageStatus.READ as String
            const recipientId = item.senderId
            console.log("Sending 'sendMessageStatusUpdate' Socket Event", messageId, recipientId)
            socket.emit("sendMessageStatusUpdate", { messageId, recipientId, newStatus })
        }
    }

    const handleOpenChat = async (item: INotification, sender: IUser) => {
        setSelectedChatId(item.chatId)
        setRecipient(sender)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="group flex items-center p-2">
                        <span className="relative inline-block mt-1">
                            <Bell aria-hidden="true" className={`w-6 h-6 text-gray-700 fill-current dark:text-light-2 ${unreadNotifications.length > 0 ? 'animate-bounce' : ''} group-hover:animate-none`} />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1.5 text-sm font-bold leading-none text-dark-4 transform translate-x-1/2 -translate-y-1/2 bg-purple-400/70 rounded-full">
                                    {notifications.length}
                                </span>
                            )}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end" forceMount>
                {(sortedNotifications.length > 0 && !allUsersLoading) ? sortedNotifications.map((item, idx) => {
                    const sender = allUsers?.data.users.find((u: IUser) => u.id === item.senderId) as IUser
                    const formattedCreatedAt = format(item.date, 'dd/MM/yyyy');
                    const messageDate = new Date(item.date);
                    const isTodayMessage = isToday(messageDate);
                    const formattedDate = isTodayMessage ? `Today at ${format(messageDate, 'HH:mm')}` : formattedCreatedAt;

                    return (
                        <DropdownMenuSub key={idx}>
                            <div className="flex flex-row justify-between">
                                <DropdownMenuLabel>
                                    <h2>{sender.name}{" "}<span className="font-normal">sent you a Message!</span></h2>
                                    {formattedDate && <h2 className="text-xs text-muted-foreground font-normal">{formattedDate}</h2>}
                                </DropdownMenuLabel>
                                <DropdownMenuSubTrigger />
                            </div>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-40">
                                    <DropdownMenuItem onClick={() => handleOpenChat(item, sender)}>
                                        <Navigation className="mr-2 h-4 w-4" />
                                        <span>View Chat</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleMarkAsRead(item)}>
                                        <FileCheck className="mr-2 h-4 w-4" />
                                        <span>Mark as Read</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => removeNotification(item.id)}>
                                        <FileX className="mr-2 h-4 w-4" />
                                        <span>Remove</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                            <DropdownMenuSeparator />
                        </DropdownMenuSub>
                    )
                }) : (<><p>You have no Notifications</p></>)}

                {notifications.length > 0 && <Button className="w-full" size={"sm"} variant={"secondary"} onClick={() => { setOpen(false); clearNotifications() }}>Clear All</Button>}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}