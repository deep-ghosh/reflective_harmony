import { Router } from "express";
import { getEncrytion } from "../controllers/encrytion.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/", authMiddleware, getEncrytion);

export default router;
