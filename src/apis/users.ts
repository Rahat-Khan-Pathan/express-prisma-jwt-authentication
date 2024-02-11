import bcrypt from "bcryptjs";
import { Router, Request, Response } from "express";
import prisma from "../services/db";
import Joi from "joi";
import * as dotenv from "dotenv";
// import passport from "passport";
import * as jwt from "jsonwebtoken";
import authMiddleWare from "../middleware/auth";

const userRouter = Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

// Read
userRouter.get("/get_users", async (req: Request, res: Response) => {
    try {
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                created_at: true,
                posts: {
                    select: {
                        id: true,
                        title: true,
                        text: true,
                        comment_count: true,
                        comments: {
                            select: {
                                id: true,
                                text: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(200).json({
            data: allUsers,
            message: "Users loaded successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't get users. Server error.",
        });
    }
});

// Create
userRouter.post("/add_user", async (req: Request, res: Response) => {
    const userSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    const reqData = await userSchema.validate(req.body);
    if (reqData.error) {
        return res.status(404).json({
            error: reqData.error.details[0].message,
        });
    }
    const { name, email, password } = req.body;
    try {
        const findUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (findUser) {
            res.status(400).send("Email already taken.");
        } else {
            try {
                const hashPassword = await bcrypt.hashSync(password, 10);
                const newUser = await prisma.user.create({
                    data: {
                        name: name,
                        email: email,
                        password: hashPassword,
                    },
                });
                const { password: pass, ...userWithoutPassword } = newUser;
                res.status(200).json({
                    data: userWithoutPassword,
                    message: "User created successfully.",
                });
            } catch (error) {
                res.status(500).json({
                    error: error,
                    message: "User not created. Server error.",
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't check duplicate user. Server error.",
        });
    }
});

// Update
userRouter.put("/update_user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                name: name,
            },
        });
        res.status(200).json({
            data: updatedUser,
            message: "User updated successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "User not updated. Server error.",
        });
    }
});

// Delete
userRouter.delete("/delete_user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedUser = await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
        res.status(200).json({
            data: deletedUser,
            message: "User deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't delete user. Server error.",
        });
    }
});
// Login
userRouter.post("/user_login", async (req: Request, res: Response) => {
    const userSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    const reqData = await userSchema.validate(req.body);
    if (reqData.error) {
        return res.status(404).json({
            error: reqData.error.details[0].message,
        });
    }
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            res.status(403).json({
                data: null,
                message: "User not found with email.",
            });
        }
        if (!bcrypt.compareSync(password, user?.password as string)) {
            res.status(403).json({
                data: null,
                message: "Wrong password.",
            });
        }
        const token = jwt.sign(
            {
                userId: user?.id,
            },
            JWT_SECRET
        );

        res.status(200).json({
            data: { user, token },
            message: "Login successfull.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't login. Server error.",
        });
    }
});

userRouter.get(
    "/user_logged",
    authMiddleWare,
    async (req: Request, res: Response) => {
        res.status(200).json({ data: req.user, message: "User logged in" });
    }
);
export default userRouter;
