import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import { create, deleteById, findByChatId, updateStatus } from "../../prisma/message";
import { Image, MessageStatus } from "@prisma/client";

export const createMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const chatId: string | null = req.body.chatId ?? null;
    const senderId: string | null = req.body.senderId ?? null;
    const content: string | null = req.body.content ?? null;
    const image: Image | undefined = req.body.image ?? null;

    if (!chatId || !senderId || !content) {
        res.status(400).json("Error with Something").end();
        return;
    }

    try {
        const newMessage = await create(chatId, senderId, content, image);
        if (newMessage) {
            res.status(201).json(newMessage).end();
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const getMessagesByChatId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const chatId: string | null = req.params.chatId ?? null;
    if (!chatId) {
        res.status(400).json("Invalid chat ID").end();
        return;
    }

    try {
        const messages = await findByChatId(chatId);
        if (messages) {
            res.status(200).json(messages).end();
        } else {
            res.status(400).json({ error: "Messages Not Found" }).end();
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const updateMessageStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const messageId: string | null = req.body.messageId ?? null;
    const newStatus: string | null = req.body.newStatus ?? null;

    if (!newStatus || !messageId) {
        res.status(400).json("Invalid Message Data").end();
        return;
    }

    if (!(newStatus in MessageStatus)) {
        res.status(400).json("Invalid message status").end();
        return;
    }

    try {
        const updatedMesage = await updateStatus(messageId, newStatus as MessageStatus);
        res.status(200).json({ updatedMesage, status: 'success' }).end();
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const deleteMessageById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const messageId: string | null = req.params.id ?? null;
    if (!messageId) {
        res.status(400).json("Invalid Message Id").end();
        return;
    }

    try {
        const message = await deleteById(messageId);
        res.status(200).json(message).end();
    } catch (error) {
        console.error(error);
        next(error);
    }
});