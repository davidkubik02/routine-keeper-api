import express from "express";
import { evaluateTasks, collectReward, getRewards, addReward } from "../controllers/evaluation.js";
import { authenticateToken } from "../controllers/auth.js";
const router = express.Router();

router.post("/", authenticateToken, evaluateTasks);
router.delete("/collectReward", authenticateToken, collectReward);
router.get("/getRewards", authenticateToken, getRewards);
router.post("/addReward", authenticateToken, addReward);
export default router;
