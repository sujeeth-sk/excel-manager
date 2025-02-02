import { Request, Response } from "express";
import UserModel from "../models/User";
import jwt from "jsonwebtoken";

const secretSalt = process.env.JWT_SECRET_SALT || "secret";

const createCurrentUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      res.status(200).send();
      return;
    }
    const userDoc = await UserModel.create({
      username,
      password /*: bcrypt.hashSync(password, salt),*/,
    });
    console.log(userDoc);
    res.status(201).json({ message: "user created" });
  } catch (error) {
    res.status(400).json({ message: "unable to create user" });
    console.log(error);
  }
};

const loginCurrentUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(400).json({ message: "invalid username or password" });
      return;
    }

    const passOk = user.password === password;
    if (!passOk) {
      res.status(400).json({ message: "invalid username or password" });
      return
    }

    jwt.sign(
        { username, _id: user._id }, // Changed 'id' to '_id' to match middleware
        secretSalt, // Use same secret as middleware
        { expiresIn: '1h' }, // Added expiration for security
        (err, token) => {
          if (err) {
            res.status(500).json({ message: "Token generation failed" });
            return;
          }
          res.cookie("token", token).json({
            _id: user._id, // Changed 'id' to '_id' for consistency
            username
          });
        }
      );
  } catch (error) {
    res.status(400).json({ message: "unable to login" });
  }
};

const logoutCurrentUser = async (req: Request, res: Response) => {
    res.clearCookie("token").json({ message: "logged out" });
}

export default { createCurrentUser, loginCurrentUser, logoutCurrentUser };
