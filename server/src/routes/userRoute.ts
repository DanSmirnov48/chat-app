import express from "express";
import {
    findAll,
    findUser,
    logIn,
    logout,
    protect,
    signup,
    updateUserDetails,
    validate,
} from "../controller/userController";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", logIn);
router.route("/logout").get(logout);
router.route("/validate").get(validate);

router.get("/find:userId", findUser);
router.get("/", findAll);

router.route("/update-me").patch(protect, updateUserDetails);

export default router;
