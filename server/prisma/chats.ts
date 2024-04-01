import { PrismaClient, Chat } from "@prisma/client";

const prisma = new PrismaClient();

export async function create(user1Id: string, user2Id: string): Promise<Chat> {
    const existingChat = await findChatByUsers(user1Id, user2Id);
    if (existingChat) {
        return existingChat;
    }

    const newChat = await prisma.chat.create({
        data: {
            users: {
                connect: [{ id: user1Id }, { id: user2Id }]
            }
        },
    });

    return newChat;
}

export async function findChatByUsers(user1Id: string, user2Id: string): Promise<Chat | null> {
    const existingChat = await prisma.chat.findFirst({
        where: {
            AND: [
                {
                    users: {
                        some: {
                            id: user1Id
                        }
                    }
                },
                {
                    users: {
                        some: {
                            id: user2Id
                        }
                    }
                }
            ]
        },
        include: {
            _count: false,
            Message: false,
            users: false
        },
    });

    return existingChat;
}

export async function findChatsByUser(userId: string): Promise<Chat[]> {
    const userChats = await prisma.chat.findMany({
        where: {
            users: {
                some: {
                    id: userId
                }
            }
        },
        include: {
            _count: false,
            Message: false,
            users: true
        },
    });

    return userChats;
}
