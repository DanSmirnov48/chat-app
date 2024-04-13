import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { findChatsByUser } from "../../prisma/chats";
import jwt, { Secret, VerifyOptions } from "jsonwebtoken";
import { findByChatId, updateStatus } from "../../prisma/message";
import { Chat, Message, MessageStatus, User } from "@prisma/client";

export type Notification = {
    id: string;
    status: MessageStatus;
    senderId: string;
    chatId: string;
    content: string;
    messageId: string;
    isRead: boolean;
    date: Date;
}

export interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}

export async function processIncomingMessages(user: User): Promise<{ incomingMessages: Message[], notifications: Notification[] }> {
    const userChats: Chat[] = await findChatsByUser(user.id);
    const incomingMessages: Message[] = [];
    const notifications: Notification[] = [];

    for (const chat of userChats) {
        const chatMessages = await findByChatId(chat.id);
        const messages = chatMessages.filter(message => {
            return message.senderId !== user.id
                && (message.status !== MessageStatus.READ && message.status !== MessageStatus.DELIVERED);
        });

        for (const message of messages) {
            await updateStatus(message.id, MessageStatus.DELIVERED);
            message.status = MessageStatus.DELIVERED;
            incomingMessages.push(message);

            const notification: Notification = {
                id: uuidv4(),
                status: message.status,
                senderId: message.senderId,
                chatId: message.chatId,
                content: message.content,
                messageId: message.id,
                isRead: false,
                date: message.createdAt,
            };
            notifications.push(notification);
        }
    }

    return { incomingMessages, notifications };
}

const verifyAsync = promisify<string, Secret, VerifyOptions, DecodedToken>(jwt.verify);

export const verifyToken = async (token: string, secret: Secret): Promise<DecodedToken> => {
    return await verifyAsync(token, secret, {});
}

export const signToken = (id: string, secret: string, expiresIn: string | number) => {
    if (!secret) {
        throw new Error("JWT secret is missing.");
    }

    return jwt.sign({ id }, secret, {
        expiresIn,
    });
};