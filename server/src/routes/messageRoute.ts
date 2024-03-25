import express from 'express';
import { createMessage, getMessagesByChatId } from '../controller/messageController';

const router = express.Router();

router.post("/", createMessage);
router.get("/:chatId", getMessagesByChatId);

export default router;
