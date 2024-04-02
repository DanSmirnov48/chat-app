import express from 'express';
import { createChat, findChatByChatId, findChatById, findUserChat } from '../controller/chatController';

const router = express.Router();

router.post("/", createChat);
router.get("/find", findChatById);
router.get("/findById/:chatId", findChatByChatId);
router.get("/:userId", findUserChat);

export default router;
