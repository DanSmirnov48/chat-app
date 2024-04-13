import express from 'express';
import { createChat, findChatByChatId, findChatById, findUserChat } from '../controller/chatController';
import { protect } from '../controller/authController';

const router = express.Router();

router.post("/", protect, createChat);
router.get("/find", protect, findChatById);
router.get("/findById/:chatId", protect, findChatByChatId);
router.get("/:userId", protect, findUserChat);

export default router;
