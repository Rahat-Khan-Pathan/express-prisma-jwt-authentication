import { Router, Request, Response } from "express";
import prisma from "../services/db";
import Joi from "joi";
import bcrypt from "bcryptjs";
const commentRouter = Router();

// Read
commentRouter.get("/get_comments", async (req: Request, res: Response) => {
    try {
        const allComments = await prisma.comment.findMany({
            orderBy: {
                id: "desc",
            },
        });
        res.status(200).json({
            data: allComments,
            message: "Comments loaded successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't get comments. Server error.",
        });
    }
});

// Create
commentRouter.post("/add_comment", async (req: Request, res: Response) => {
    const commentSchema = Joi.object({
        user_id: Joi.number().required(),
        post_id: Joi.number().required(),
        text: Joi.string().required(),
    });
    const reqData = await commentSchema.validate(req.body);
    if (reqData.error) {
        return res.status(404).json({
            error: reqData.error.details[0].message,
        });
    }
    const { user_id, post_id, text } = req.body;
    try {
        const updatedPost = await prisma.post.update({
            where: {
                id: Number(post_id),
            },
            data: {
                comment_count: {
                    increment: 1,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Could not update comment count. Server error.",
        });
    }
    try {
        const newComment = await prisma.comment.create({
            data: {
                user_id: Number(user_id),
                post_id: Number(post_id),
                text,
            },
        });
        res.status(200).json({
            data: newComment,
            message: "Comment created successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Comment not created. Server error.",
        });
    }
});

// Update
commentRouter.put(
    "/update_comment/:id",
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { text } = req.body;
        try {
            const updatedComment = await prisma.comment.update({
                where: {
                    id,
                },
                data: {
                    text,
                },
            });
            res.status(200).json({
                data: updatedComment,
                message: "Comment updated successfully.",
            });
        } catch (error) {
            res.status(500).json({
                error: error,
                message: "Comment not updated. Server error.",
            });
        }
    }
);

// Delete
commentRouter.delete(
    "/delete_comment/:id",
    async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const deletedComment = await prisma.comment.delete({
                where: {
                    id: id,
                },
            });
            res.status(200).json({
                data: deletedComment,
                message: "Comment deleted successfully.",
            });
        } catch (error) {
            res.status(500).json({
                error: error,
                message: "Couldn't delete comment. Server error.",
            });
        }
    }
);
export default commentRouter;
