import validator from "validator";
import { Message, User } from "@prisma/client";
import { asyncHandler } from "../middlewares";
import { NextFunction, Request, Response } from "express";
import { findUserByEmail, createUser, } from "../../prisma/user";
import { processIncomingMessages, Notification, signToken, validateSession, readSessionCookie } from '../utils';

const createSendToken = (
    user: User,
    statusCode: number,
    req: Request,
    res: Response,
    incomingMessages?: Message[],
    notifications?: Notification[]
) => {
    const accessToken = signToken(user.id.toString(), process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN!);

    const accessExpires = 24 * 60 * 60 * 1000; // 24 hours
    const accessExpirationDate = new Date(Date.now() + accessExpires);

    res.cookie('accessToken', accessToken, {
        expires: accessExpirationDate,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
    });

    // Set the user object to the res.locals
    res.locals.user = user;
    req.user = user;

    const { password: _, ...userWithoutPassword } = user;

    return res.status(statusCode).json({
        status: 'success',
        accessToken,
        data: {
            userWithoutPassword,
            incomingMessages,
            notifications,
        },
    }).end();
};

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user || (req.locals && req.locals.user)) {
        console.log("the req.user exists");
        return next();
    }
    console.log("the req.user does not exist");

    try {
        const token = readSessionCookie(req.headers.cookie ?? '');

        if (!token) return next()

        const user = await validateSession(token);
        if (!user) {
            return next(
                new Error('The user belonging to this token does not exist.')
            );
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authentication middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const validate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        res.status(401).json({ error: 'No access token provided' });
        return;
    }

    const user = await validateSession(accessToken);

    if (!user) {
        res.status(401).json({ error: 'Invalid token - user not found' });
        return;
    }

    res.status(200).json({
        status: 'success',
        accessToken,
        data: {
            user
        }
    });
});

export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const name: string | null = req.body.name ?? null;
    const email: string | null = req.body.email ?? null;
    const password: string | null = req.body.password ?? null;

    if (!name || name.length < 3 || name.length > 31) {
        res.status(400).json("Invalid password").end();
        return; // Return here to exit the function
    }

    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
        res.status(400).json("Invalid Email").end();
        return; // Return here to exit the function
    }

    if (!password || password.length < 6 || password.length > 255) {
        res.status(400).json("Invalid password").end();
        return; // Return here to exit the function
    }

    try {
        const user = await findUserByEmail({ email: email });
        if (user) {
            res.status(404).json({ error: 'Email not available' });
            return; // Return here to exit the function
        }

        const createdAUser = await createUser({ name, email, password });
        res.status(201).json({ user: createdAUser }).end();
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const logIn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const email: string | null = req.body.email ?? null;
    const password: string | null = req.body.password ?? null;

    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
        res.status(400).json("Invalid Email").end();
        return;
    }

    if (!password || password.length < 6 || password.length > 255) {
        res.status(400).json("Invalid password").end();
        return;
    }

    try {
        const user = await findUserByEmail({ email: email });
        console.log({ user });

        if (user) {
            // if (!user || !(await bcrypt.compare(password, user.password))) {
            //   return res.status(401).json({ error: 'Incorrect email or password' });
            // }
            const { incomingMessages, notifications } = await processIncomingMessages(user);

            createSendToken(user, 200, req, res, incomingMessages, notifications);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export const logout = (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.status(200).json({ status: 'success' });
    res.end()
};