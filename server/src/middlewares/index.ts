import { NextFunction, Request, Response } from "express";
import { readSessionCookie, validateSession } from "../utils";

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

export const checkRequestMethod = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET") {
        return next();
    }
    const originHeader = req.headers.origin ?? null;
    const hostHeader = req.headers.host ?? null;
    if (!originHeader || !hostHeader) {
        return res.status(403).end();
    }
    return next();
};

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = readSessionCookie(req.headers.cookie ?? "");
    if (!accessToken) {
        res.locals.user = null;
        return next();
    }

    const user = await validateSession(accessToken);
    if (!user) {
        res.locals.user = null;
        return next();
    }

    res.locals.user = user;
    req.user = user;
    return next();
};