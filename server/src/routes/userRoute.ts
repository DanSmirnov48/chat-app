import express from 'express';
import { findAll, findUser, logIn, signup } from '../controller/userController';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", logIn);

router.get("/find:userId", findUser);
router.get("/", findAll);

export default router;
