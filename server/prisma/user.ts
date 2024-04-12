import { Image, PrismaClient, User } from "@prisma/client";
import validator from "validator";
import * as bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

export const createUser = async ({
    name,
    email,
    password,
}: {
    name: User["name"];
    email: User["email"];
    password: User["password"];
}) => {

    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    const createdUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashed_password,
        },
    });

    // Exclude the password field from the createdUser object
    const { password: _, ...userWithoutPassword } = createdUser;

    return userWithoutPassword;
};

export const findUserByEmail = async ({ email }: { email: User["email"] }) => {
    const author = await prisma.user.findUnique({
        where: { email },
        include: {
            _count: false,
            chats: false,
            Message: false,
        }
    });

    return author;
};

export const findUserById = async ({ id }: { id: User["id"] }) => {
    const author = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: false,
            chats: false,
            Message: false,
        }
    });

    return author;
};

export const getAllUSers = async () => {
    const author = await prisma.user.findMany();

    return author;
};

interface UpdateUserDetailsInput {
    id: string;
    name?: string | null;
    bio?: string | null;
    image?: Image | null;
}

export const updateDetails = async (input: UpdateUserDetailsInput) => {
    const { id, name, bio, image } = input;

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: name ? { set: name } : undefined,
                bio: bio ? { set: bio } : undefined,
                image: image ? { set: image } : undefined,
            },
        });
        return updatedUser;
    } catch (error) {
        console.error('Error updating user details:', error);
        return null;
    }
}