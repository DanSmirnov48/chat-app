import { PrismaClient, User } from "@prisma/client";
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
    });

    return author;
};
