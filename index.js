import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tasksRoutes from "./routes/tasks.js";
import userInfoRouter from "./routes/userInfo.js";
import cookieParser from "cookie-parser";
import evaluationRouter from "./routes/evaluation.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);
app.use("/user", userInfoRouter);
app.use("/evaluation", evaluationRouter);

app.listen(8080, () => console.log("Connected!"));
