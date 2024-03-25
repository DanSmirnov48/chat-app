import express, { Application, Request, Response } from "express";
import cors from 'cors';
import connectDB from "./config/db";
import { config } from "dotenv";
import userRouter from './routes/userRoute';
import chatRouter from './routes/chatRoute';
import messageRouter from './routes/messageRoute';
import type { User } from '@prisma/client';

config()
connectDB()

const app: Application = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.send("Healthy");
})

app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/messages', messageRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

declare global {
    namespace Express {
        interface Locals {
            user: User | null;
        }
    }
}