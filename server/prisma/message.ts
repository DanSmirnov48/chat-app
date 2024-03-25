import { Message, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function create(chatId: string, senderId: string, content: string): Promise<Message> {
    try {
        const newMessage = await prisma.message.create({
            data: {
                content: content,
                senderId: senderId,
                chatId: chatId
            }
        });

        return newMessage;
    } catch (error) {
        throw new Error(`Error creating message: ${error}`);
    }
}

export async function findByChatId(chatId: string): Promise<Message[]> {
    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId: chatId
            },
            include: {
                chat: false,
                sender: false,
            },
        });

        return messages;
    } catch (error) {
        throw new Error(`Error retrieving messages: ${error}`);
    }
}