import express from "express"
import { getTasks } from "../controllers/tasks.js"
import { authenticateToken } from "../controllers/auth.js"
const router = express.Router()


router.get("/getTasks", authenticateToken, getTasks)

export default router