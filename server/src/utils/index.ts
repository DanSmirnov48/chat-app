import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { findChatsByUser } from "../../prisma/chats";
import jwt, { Secret, VerifyOptions } from "jsonwebtoken";
import { findByChatId, updateStatus } from "../../prisma/message";
import { Chat, Message, MessageStatus, User } from "@prisma/client";
import { findUserById } from '../../prisma/user';

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

const verifyToken = async (token: string, secret: Secret): Promise<DecodedToken> => {
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

export const readSessionCookie = (token: string): string | undefined => {
    if (token) {
        const cookies = token.split(';');
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
        if (accessTokenCookie) {
            const accessToken = accessTokenCookie.split('=')[1];
            return accessToken;
        }
    }
    return undefined;
};

export const validateSession = async (accessToken: string): Promise<User | null> => {
    if (accessToken) {
        try {
            const decodedToken: DecodedToken = await verifyToken(accessToken, process.env.JWT_SECRET as string);
            if (decodedToken) {
                const user = await findUserById({ id: decodedToken.id });
                return user;
            }
        } catch (error) {
            console.error('Error validating session:', error);
            return null;
        }
    }
    return null;
};