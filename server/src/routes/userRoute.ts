import express from 'express';
import { signup } from '../controller/userController';

const router = express.Router();

router.post("/signup", signup);

export default router;
