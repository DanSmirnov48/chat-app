import express, { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { findUserByEmail, createUser } from "../../prisma/user";
import validator from "validator";

export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const name: string | null = req.body.name ?? null;
    const email: string | null = req.body.email ?? null;
    const password: string | null = req.body.password ?? null;

    if (!name || name.length < 3 || name.length > 31 || !/^[a-z0-9_-]+$/.test(name)) {
        return res.status(400).json("Invalid password").end();
    }
    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
        return res.status(400).json("Invalid Email").end();
    }
    if (!password || password.length < 6 || password.length > 255) {
        return res.status(400).json("Invalid password").end();
    }

    try {
        const user = await findUserByEmail({ email: email });
        if (user) {
            return res.status(404).json({ error: 'Email not availiable' });
        }

        const createdAUser = await createUser({ name, email, password });
        return res.status(201).json({ user: createdAUser }).end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the author.' });
    }

    return res.status(200).json({ status: 'success' }).end();
});
