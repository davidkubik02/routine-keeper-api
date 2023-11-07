import express from "express"
import { getUser } from "../controllers/userInfo.js"
import { authenticateToken } from "../controllers/auth.js"
const router = express.Router()


router.get("/getUsername", authenticateToken, getUser)

export default router