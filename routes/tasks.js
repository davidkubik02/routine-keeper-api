import express from "express";
import {
  getTasks,
  getTask,
  dailyReset,
  resetTasks,
  updateTask,
  storeTask,
  deleteTask,
  toggleTaskStatus,
  updateNote,
} from "../controllers/tasks.js";
import { authenticateToken } from "../controllers/auth.js";
const router = express.Router();

router.get("/getTasks", authenticateToken, getTasks);
router.get("/getTask", authenticateToken, getTask);
router.post("/dailyReset", authenticateToken, dailyReset);
router.post("/resetTasks", authenticateToken, resetTasks);
router.post("/storeTask", authenticateToken, storeTask);
router.put("/updateTask", authenticateToken, updateTask);
router.delete("/deleteTask", authenticateToken, deleteTask);
router.put("/toggleTaskStatus", authenticateToken, toggleTaskStatus);
router.put("/updateNote", authenticateToken, updateNote);

export default router;
