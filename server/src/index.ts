import express, { Application, Request, Response } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import userRouter from './routes/userRoute';
import chatRouter from './routes/chatRoute';
import messageRouter from './routes/messageRoute';
import type { User } from '@prisma/client';
import { createUploadthingExpressHandler } from "uploadthing/express";
import { uploadRouter } from "./utils/uploadthing";
import { readSessionCookie, validateSession } from "./utils";

config()

const app: Application = express();
const port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    credentials: true,
}));

app.use((req, res, next) => {
    if (req.method === "GET") {
        return next();
    }
    const originHeader = req.headers.origin ?? null;
    const hostHeader = req.headers.host ?? null;
    if (!originHeader || !hostHeader) {
        return res.status(403).end();
    }
    return next();
});

app.use(async (req, res, next) => {
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
});

app.get("/", (req: Request, res: Response) => {
    res.send("Healthy");
})

app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/messages', messageRouter);
app.use("/api/uploadthing", createUploadthingExpressHandler({ router: uploadRouter }));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

declare global {
    namespace Express {
        interface Request {
            locals: {
                user: User | null;
            };
            user: User | null;
        }
    }
}