import express from "express";
import {
    createMessage,
    getMessagesByChatId,
    updateMessageStatus,
} from "../controller/messageController";

const router = express.Router();

router.post("/", createMessage);
router.get("/:chatId", getMessagesByChatId);
router.patch("/update-status", updateMessageStatus);

export default router;
