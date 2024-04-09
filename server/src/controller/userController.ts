import express, { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { findUserByEmail, createUser, findUserById, getAllUSers } from "../../prisma/user";
import validator from "validator";
import jwt, { Secret, VerifyOptions } from "jsonwebtoken";
import { Chat, Message, MessageStatus, User } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { promisify } from 'util';
import { findChatsByUser } from "../../prisma/chats";
import { findByChatId, updateStatus } from "../../prisma/message";
import { v4 as uuidv4 } from 'uuid';

interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}

type Notification = {
    id: string;
    status: MessageStatus;
    senderId: string;
    chatId: string;
    content: string;
    messageId: string;
    isRead: boolean;
    date: Date;
}

const signToken = (id: string, secret: string, expiresIn: string | number) => {
    if (!secret) {
        throw new Error("JWT secret is missing.");
    }

    return jwt.sign({ id }, secret, {
        expiresIn,
    });
};

const verifyAsync = promisify<string, Secret, VerifyOptions, DecodedToken>(jwt.verify);

const verifyToken = async (token: string, secret: Secret): Promise<DecodedToken> => {
    return await verifyAsync(token, secret, {});
}

const createSendToken = (user: User, statusCode: number, req: Request, res: Response, incomingMessages?: Message[], notifications?: Notification[]) => {
    const accessToken = signToken(user.id.toString(), process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN!);

    const accessExpires = 24 * 60 * 60 * 1000; // 24 hours
    const accessExpirationDate = new Date(Date.now() + accessExpires);

    res.cookie('accessToken', accessToken, {
        expires: accessExpirationDate,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(statusCode).json({
        status: 'success',
        accessToken,
        data: {
            userWithoutPassword,
            incomingMessages,
            notifications
        }
    }).end();
};

export const signup = asyncHandler(async (req: Request, res: Response) => {

    const name: string | null = req.body.name ?? null;
    const email: string | null = req.body.email ?? null;
    const password: string | null = req.body.password ?? null;

    if (!name || name.length < 3 || name.length > 31) {
        return res.status(400).json("Invalid password").end();
    }
    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
        return res.status(400).json("Invalid Email").end();
    }
    if (!password || password.length < 6 || password.length > 255) {
        return res.status(400).json("Invalid password").end();
    }

    try {
        const user = await findUserByEmail({ email: email });
        if (user) {
            return res.status(404).json({ error: 'Email not availiable' });
        }

        const createdAUser = await createUser({ name, email, password });
        return res.status(201).json({ user: createdAUser }).end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});

export const logIn = asyncHandler(async (req: Request, res: Response) => {

    const email: string | null = req.body.email ?? null;
    const password: string | null = req.body.password ?? null;

    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
        return res.status(400).json("Invalid Email").end();
    }
    if (!password || password.length < 6 || password.length > 255) {
        return res.status(400).json("Invalid password").end();
    }

    try {
        const user = await findUserByEmail({ email: email });
        console.log({ user })

        if (user) {
            // if (!user || !(await bcrypt.compare(password, user.password))) {
            //     return res.status(401).json({ error: 'Incorrect email or password' });
            // }

            const { incomingMessages, notifications } = await processIncomingMessages(user);

            createSendToken(user, 200, req, res, incomingMessages, notifications);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});

async function processIncomingMessages(user: User): Promise<{ incomingMessages: Message[], notifications: Notification[] }> {
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

export const logout = (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.status(200).json({ status: 'success' });
    res.end()
};

export const validate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    if (accessToken && accessToken !== undefined) {
        try {
            const decodedToken: DecodedToken = await verifyToken(accessToken, process.env.JWT_SECRET as string);
            console.log('Decoded token:', decodedToken);

            const user = await findUserById({ id: decodedToken.id });

            if (!user) {
                return res.status(401).json({ error: 'Invalid token - user not found' });
            }

            res.locals.user = user;
            return res.status(200).json({
                status: 'success',
                accessToken,
                data: {
                    user
                }
            }).end();
        } catch (error) {
            console.error('Access Token Verification Error:', error);
            return res.status(401).json({ error: 'Invalid access token' });
        }
    }
});

export const findUser = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id || typeof id !== "string") {
        return res.status(400).json("Invalid User ID").end();
    }

    try {
        const user = await findUserById({ id: id });

        return res.status(200).json({ user: user }).end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});

export const findAll = asyncHandler(async (req: Request, res: Response) => {

    try {
        const users = await getAllUSers();

        return res.status(200).json({ users }).end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});