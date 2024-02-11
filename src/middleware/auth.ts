import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import prisma from "../services/db";
import { User } from "@prisma/client";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

declare global {
    namespace Express {
        export interface Request {
            user?: User;
        }
    }
}

const authMiddleWare = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization!;
    if (!token) {
        res.status(500).json({
            message: "Token not found.",
        });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId,
            },
        });
        if (!user) {
            res.status(500).json({
                message: "Couldn't login. User not found.",
            });
        }
        req.user = user!;
        next();
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't login. Server error.",
        });
    }
};

export default authMiddleWare;
