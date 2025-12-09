import { Router } from "express";
import {
  getLogin,
  getRegister,
  getLogout,
  getRefresh,
  getMe,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", (_req, res) =>
  res.json({
    message: "Auth endpoints",
    endpoints: {
      "POST /auth/register": "Register new user",
      "POST /auth/login": "Login user",
      "POST /auth/refresh": "Refresh access token",
      "POST /auth/logout": "Logout user",
      "POST /auth/me": "Get current user (requires auth)",
    },
  })
);

router.post("/register", getRegister);
router.post("/login", getLogin);
router.post("/refresh", getRefresh);
router.post("/logout", getLogout);
router.post("/me", authMiddleware, getMe);

export default router;
