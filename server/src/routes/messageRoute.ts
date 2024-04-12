import express from "express";
import {
    createMessage,
    deleteMessageById,
    getMessagesByChatId,
    updateMessageStatus,
} from "../controller/messageController";

const router = express.Router();

router.post("/", createMessage);
router.get("/:chatId", getMessagesByChatId);
router.patch("/update-status", updateMessageStatus);
router.delete("/delete/:id", deleteMessageById);

export default router;
