import express, { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { create, findByChatId} from "../../prisma/message";
import { Message } from "@prisma/client";

export const createMessage = asyncHandler(async (req: Request, res: Response) => {

    const chatId: string | null = req.body.chatId ?? null;
    const senderId: string | null = req.body.senderId ?? null;
    const content: string | null = req.body.content ?? null;

    if (!chatId || !senderId || !content) {
        return res.status(400).json("Error with Something").end();
    }

    try {
        const newMessage = await create(chatId, senderId, content);
        if (newMessage) {
            return res.status(201).json(newMessage).end();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});

export const getMessagesByChatId = asyncHandler(async (req: Request, res: Response) => {

    const chatId: string | null = req.params.chatId ?? null;

    if (!chatId ) {
        return res.status(400).json("Invalid chat ID").end();
    }

    try {
        const messages = await findByChatId(chatId);
        if (messages) {
            return res.status(200).json(messages).end();
        } else {
            return res.status(400).json({ error: "Messages Not Found" }).end();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});