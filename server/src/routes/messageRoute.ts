import express from "express";
import {
    createMessage,
    deleteMessageById,
    getMessagesByChatId,
    updateMessageStatus,
} from "../controller/messageController";
import { protect } from "../controller/userController";

const router = express.Router();

router.post("/", protect, createMessage);
router.get("/:chatId", protect, getMessagesByChatId);
router.patch("/update-status", protect, updateMessageStatus);
router.delete("/delete/:id", protect, deleteMessageById);

export default router;
