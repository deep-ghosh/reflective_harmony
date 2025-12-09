import { Router } from "express";
import healthRoutes from "./health.route.js";

const router = Router();


router.get("/", (_req, res) => res.json({ message: "Welcome" }));

export default router;


