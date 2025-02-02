// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  username: string;
  _id: string;
}

interface Iuser {
  username: string;
  _id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: Iuser;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    req.user = {
      username: decoded.username,
      _id: decoded._id,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export default authMiddleware;
