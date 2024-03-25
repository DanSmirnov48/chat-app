import express from 'express';
import { createChat, findChatById, findUserChat } from '../controller/chatController';

const router = express.Router();

router.post("/", createChat);
router.get("/find", findChatById);
router.get("/:userId", findUserChat);

export default router;
