import express, { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { findChatByUsers, create, findChatsByUser } from "../../prisma/chats";
import { Chat } from "@prisma/client";

export const createChat = asyncHandler(async (req: Request, res: Response) => {

    const user1Id: string | null = req.body.user1Id ?? null;
    const user2Id: string | null = req.body.user2Id ?? null;

    if (!user1Id || !user2Id) {
        return res.status(400).json("Invalid IDs").end();
    }

    try {
        const existingChat: Chat | null = await findChatByUsers(user1Id, user2Id);
        if (existingChat) {
            return res.status(200).json(existingChat).end();
        }

        const chat: Chat = await create(user1Id, user2Id);
        if (chat) {
            return res.status(201).json(chat).end();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});

export const findUserChat = asyncHandler(async (req: Request, res: Response) => {

    const userId: string | null = req.params.userId ?? null;

    if (!userId || typeof userId !== "string") {
        return res.status(400).json("Invalid User ID").end();
    }

    try {
        const userChats: Chat[] = await findChatsByUser(userId);
        if (userChats) {
            return res.status(201).json(userChats).end();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});

export const findChatById = asyncHandler(async (req: Request, res: Response) => {

    const user1Id: string | null = req.body.firstId ?? null;
    const user2Id: string | null = req.body.secondId ?? null;

    if (!user1Id || !user2Id) {
        return res.status(400).json("Invalid IDs").end();
    }

    try {
        const existingChat: Chat | null = await findChatByUsers(user1Id, user2Id);
        if (existingChat) {
            return res.status(200).json(existingChat).end();
        } else {
            return res.status(400).json({ error: "Chat Not Found" }).end();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});