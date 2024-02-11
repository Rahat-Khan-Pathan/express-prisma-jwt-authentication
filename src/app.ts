import express, { Request, Response } from "express";
import bodyparser from "body-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import userRouter from "./apis/users";
import postRouter from "./apis/post";
import commentRouter from "./apis/comment";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyparser.json());
const port = process.env.PORT || 5001;

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);

app.get("/", (req: Request, res: Response): void => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
