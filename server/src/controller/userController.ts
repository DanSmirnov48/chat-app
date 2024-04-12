import { promisify } from 'util';
import validator from "validator";
import { v4 as uuidv4 } from 'uuid';
import { findChatsByUser } from "../../prisma/chats";
import asyncHandler from "../middlewares/asyncHandler";
import { NextFunction, Request, Response } from "express";
import jwt, { Secret, VerifyOptions } from "jsonwebtoken";
import { findByChatId, updateStatus } from "../../prisma/message";
import { Chat, Image, Message, MessageStatus, User } from "@prisma/client";
import { findUserByEmail, createUser, findUserById, getAllUsers, updateDetails } from "../../prisma/user";

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

const createSendToken = (
    user: User,
    statusCode: number,
    req: Request,
    res: Response,
    incomingMessages?: Message[],
    notifications?: Notification[]
) => {
    const accessToken = signToken(user.id.toString(), process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN!);

    const accessExpires = 24 * 60 * 60 * 1000; // 24 hours
    const accessExpirationDate = new Date(Date.now() + accessExpires);

    res.cookie('accessToken', accessToken, {
        expires: accessExpirationDate,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
    });

    // Set the user object to the res.locals
    res.locals.user = user;

    const { password: _, ...userWithoutPassword } = user;

    return res.status(statusCode).json({
        status: 'success',
        accessToken,
        data: {
            userWithoutPassword,
            incomingMessages,
            notifications,
        },
    }).end();
};

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check if the user object is present in res.locals
    if (req.locals.user) {
        // User object is present, continue to the next middleware
        next();
    } else {
        // Check if the accessToken cookie is present
        const accessToken = req.cookies.accessToken;
        if (accessToken) {
            try {
                // Verify the token and extract the user ID
                const decodedToken = await verifyToken(accessToken, process.env.JWT_SECRET!);
                // Find the user by the user ID
                const user = await findUserById({ id: decodedToken.userId });
                if (user) {
                    // Set the user object in req.locals
                    req.locals.user = user;
                    // Continue to the next middleware
                    next();
                } else {
                    // User not found, send a 401 Unauthorized response
                    res.status(401).json({ error: 'Unauthorized' });
                }
            } catch (error) {
                // Error verifying the token, send an error
                res.status(401).json({ error: 'Unauthorized' });
            }
        } else {
            // No accessToken, send an error
            res.status(401).json({ error: 'Unauthorized' });
        }
    }
});

export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const name: string | null = req.body.name ?? null;
    const email: string | null = req.body.email ?? null;
    const password: string | null = req.body.password ?? null;

    if (!name || name.length < 3 || name.length > 31) {
        res.status(400).json("Invalid password").end();
        return; // Return here to exit the function
    }

    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
        res.status(400).json("Invalid Email").end();
        return; // Return here to exit the function
    }

    if (!password || password.length < 6 || password.length > 255) {
        res.status(400).json("Invalid password").end();
        return; // Return here to exit the function
    }

    try {
        const user = await findUserByEmail({ email: email });
        if (user) {
            res.status(404).json({ error: 'Email not available' });
            return; // Return here to exit the function
        }

        const createdAUser = await createUser({ name, email, password });
        res.status(201).json({ user: createdAUser }).end();
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const logIn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const email: string | null = req.body.email ?? null;
    const password: string | null = req.body.password ?? null;

    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
        res.status(400).json("Invalid Email").end();
        return;
    }

    if (!password || password.length < 6 || password.length > 255) {
        res.status(400).json("Invalid password").end();
        return;
    }

    try {
        const user = await findUserByEmail({ email: email });
        console.log({ user });

        if (user) {
            // if (!user || !(await bcrypt.compare(password, user.password))) {
            //   return res.status(401).json({ error: 'Incorrect email or password' });
            // }
            const { incomingMessages, notifications } = await processIncomingMessages(user);

            createSendToken(user, 200, req, res, incomingMessages, notifications);
        }
    } catch (error) {
        console.error(error);
        next(error);
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

            const user = await findUserById({ id: decodedToken.userId });

            if (!user) {
                res.status(401).json({ error: 'Invalid token - user not found' });
                return;
            }

            res.locals.user = user;

            res.status(200).json({
                status: 'success',
                accessToken,
                data: {
                    user
                }
            }).end();
        } catch (error) {
            console.error('Access Token Verification Error:', error);
            res.status(401).json({ error: 'Invalid access token' });
        }
    } else {
        res.status(401).json({ error: 'No access token provided' });
    }
});

export const findUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
        res.status(400).json('Invalid User ID').end();
        return;
    }
    try {
        const user = await findUserById({ id });
        res.status(200).json({ user }).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the user.' });
    }
});

export const findAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ users }).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the users.' });
    }
});

export const updateUserDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const name: string | null = req.body.name ?? null;
    const bio: string | null = req.body.bio ?? null;
    const image: Image | null = req.body.image ?? null;

    const userId = req.locals.user?.id;
    if (userId) {
        try {
            const user = await updateDetails({ id: userId, name, bio, image });
            res.status(200).json({ user }).end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while updating the user details.' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});