import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tasksRoutes from "./routes/tasks.js";
import userInfoRouter from "./routes/userInfo.js";
import cookieParser from "cookie-parser";
import evaluationRouter from "./routes/evaluation.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use(express.static(path.join(__dirname, "client-build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client-build", "index.html"));
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Connected!"));
