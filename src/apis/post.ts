import { Router, Request, Response } from "express";
import prisma from "../services/db";
import Joi from "joi";
const postRouter = Router();

// Read
postRouter.post("/get_posts", async (req: Request, res: Response) => {
    const { searchText } = req.body;
    try {
        const allPosts = await prisma.post.findMany({
            include: {
                comments: {
                    select: {
                        id: true,
                        text: true,
                    },
                },
            },
            where: {
                text: {
                    contains: searchText,
                },
            },
            orderBy: {
                id: "desc",
            },
        });
        res.status(200).json({
            data: allPosts,
            message: "Posts loaded successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't get posts. Server error.",
        });
    }
});

// Create
postRouter.post("/add_post", async (req: Request, res: Response) => {
    const postSchema = Joi.object({
        user_id: Joi.number().required(),
        title: Joi.string().required(),
        text: Joi.string().required(),
    });
    const reqData = await postSchema.validate(req.body);
    if (reqData.error) {
        return res.status(404).json({
            error: reqData.error.details[0].message,
        });
    }
    const { user_id, title, text } = req.body;
    try {
        const newPost = await prisma.post.create({
            data: {
                user_id: Number(user_id),
                title,
                text,
            },
        });
        res.status(200).json({
            data: newPost,
            message: "Post created successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Post not created. Server error.",
        });
    }
});

// Update
postRouter.put("/update_post/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, text } = req.body;
    try {
        const updatedPost = await prisma.post.update({
            where: {
                id: Number(id),
            },
            data: {
                title,
                text,
            },
        });
        res.status(200).json({
            data: updatedPost,
            message: "Post updated successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Post not updated. Server error.",
        });
    }
});

// Delete
postRouter.delete("/delete_post/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedPost = await prisma.post.delete({
            where: {
                id: Number(id),
            },
        });
        res.status(200).json({
            data: deletedPost,
            message: "Post deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "Couldn't delete post. Server error.",
        });
    }
});
export default postRouter;
