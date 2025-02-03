import express, { NextFunction, Request, Response } from "express";
import MyUserController from "../contorllers/MyUserController";

const router = express.Router();
router.post(
  "/signup",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /signup");
    next();
  },
  MyUserController.createCurrentUser
);

router.post(
  "/login",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /login");
    next();
  },
  MyUserController.loginCurrentUser
);

router.post(
  "/logout",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /logout");
    next();
  },
  MyUserController.logoutCurrentUser
);
export default router;
