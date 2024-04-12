import { Message, MessageStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function create(chatId: string, senderId: string, content: string): Promise<Message> {
    try {
        const newMessage = await prisma.message.create({
            data: {
                content: content,
                senderId: senderId,
                chatId: chatId,
                status: MessageStatus.SENT
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

export async function updateStatus(messageId: string, newStatus: MessageStatus): Promise<void> {
    try {
        await prisma.message.update({
            where: { id: messageId },
            data: { status: newStatus },
        });
    } catch (error) {
        throw new Error(`Error updating message status: ${error}`);
    }
}

export async function deleteById(messageId: string): Promise<Message> {
    try {
        const deletedMessage = await prisma.message.delete({
            where: {
                id: messageId,
            },
        });

        return deletedMessage;
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error('An error occurred while deleting the message.');
    }
}