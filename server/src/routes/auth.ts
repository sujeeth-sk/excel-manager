import express, { NextFunction, Request, Response } from "express";
import MyUserController from "../contorllers/MyUserController";

const router = express.Router();

router.post("/signup", (next: NextFunction) => {console.log("POST /signup"); next()}, MyUserController.createCurrentUser);
router.post("/login", (next: NextFunction) => {console.log("POST /login"); next()}, MyUserController.loginCurrentUser);
router.post("/logout", (next: NextFunction) => {console.log("POST /logout"); next()},MyUserController.logoutCurrentUser);

export default router;