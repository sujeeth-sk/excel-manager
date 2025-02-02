import express from "express";
import MyUserController from "../contorllers/MyUserController";

const router = express.Router();

router.post("/signup", MyUserController.createCurrentUser);
router.post("/login", MyUserController.loginCurrentUser);
router.post("/logout", MyUserController.logoutCurrentUser);

export default router;