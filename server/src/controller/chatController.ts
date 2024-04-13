import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import { findChatByUsers, create, findChatsByUser, findById } from "../../prisma/chats";
import { Chat } from "@prisma/client";

export const createChat = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user1Id: string | null = req.body.user1Id ?? null;
    const user2Id: string | null = req.body.user2Id ?? null;

    if (!user1Id || !user2Id) {
        res.status(400).json("Invalid IDs").end();
        return;
    }

    try {
        const existingChat: Chat | null = await findChatByUsers(user1Id, user2Id);
        if (existingChat) {
            res.status(200).json(existingChat).end();
        } else {
            const chat: Chat = await create(user1Id, user2Id);
            res.status(201).json(chat).end();
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const findUserChat = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId: string | null = req.params.userId ?? null;
    if (!userId || typeof userId !== "string") {
        res.status(400).json("Invalid User ID").end();
        return;
    }

    try {
        const userChats: Chat[] = await findChatsByUser(userId);
        res.status(201).json(userChats).end();
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const findChatById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user1Id: string | null = req.body.firstId ?? null;
    const user2Id: string | null = req.body.secondId ?? null;

    if (!user1Id || !user2Id) {
        res.status(400).json("Invalid IDs").end();
        return;
    }

    try {
        const existingChat: Chat | null = await findChatByUsers(user1Id, user2Id);
        if (existingChat) {
            res.status(200).json(existingChat).end();
        } else {
            res.status(400).json({ error: "Chat Not Found" }).end();
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const findChatByChatId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const chatId: string | null = req.params.chatId ?? null;
    if (!chatId) {
        res.status(400).json("Invalid IDs").end();
        return;
    }

    try {
        const existingChat: Chat = await findById(chatId);
        if (existingChat) {
            res.status(200).json(existingChat).end();
        } else {
            res.status(400).json({ error: "Chat Not Found" }).end();
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});