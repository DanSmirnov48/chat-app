import express from 'express';
import { findAll, findUser, logIn, logout, signup, validate } from '../controller/userController';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", logIn);
router.route("/logout").get(logout);
router.route("/validate").get(validate);

router.get("/find:userId", findUser);
router.get("/", findAll);

export default router;
