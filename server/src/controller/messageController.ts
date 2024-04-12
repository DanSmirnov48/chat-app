import express, { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { create, deleteById, findByChatId, updateStatus } from "../../prisma/message";
import { Message, MessageStatus } from "@prisma/client";

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

    if (!chatId) {
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

export const updateMessageStatus = asyncHandler(async (req: Request, res: Response) => {

    const messageId: string | null = req.body.messageId ?? null;
    const newStatus: string | null = req.body.newStatus ?? null;

    if (!newStatus || !messageId) {
        return res.status(400).json("Invalid Message Data").end();
    }

    if (!(newStatus in MessageStatus)) {
        return res.status(400).json("Invalid message status").end();
    }

    try {
        await updateStatus(messageId, newStatus as MessageStatus)
        return res.status(200).json({ status: 'success' }).end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});

export const deleteMessageById = asyncHandler(async (req: Request, res: Response) => {

    const messageId: string | null = req.params.id ?? null;

    if (!messageId) {
        return res.status(400).json("Invalid Message Id").end();
    }

    try {
        const message = await deleteById(messageId)
        return res.status(200).json(message).end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }
});