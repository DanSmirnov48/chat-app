import { Image } from "@prisma/client";
import { asyncHandler } from "../middlewares";
import { NextFunction, Request, Response } from "express";
import { findUserById, getAllUsers, updateDetails } from "../../prisma/user";

export const findUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
        res.status(400).json('Invalid User ID').end();
        return;
    }
    try {
        const user = await findUserById({ id });
        res.status(200).json({ user }).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the user.' });
    }
});

export const findAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ users }).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the users.' });
    }
});

export const updateUserDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const name: string | null = req.body.name ?? null;
    const bio: string | null = req.body.bio ?? null;
    const image: Image | null = req.body.image ?? null;

    const userId = req.locals.user?.id;
    if (userId) {
        try {
            const user = await updateDetails({ id: userId, name, bio, image });
            res.status(200).json({ user }).end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while updating the user details.' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});