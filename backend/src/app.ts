import "dotenv/config";
import express from "express";
import cors from "cors";

import homeRouter from "./routes/home.route.js";
import healthRoutes from "./routes/health.route.js";
import authRouter from "./routes/auth.route.js";
import encryptionRouter from "./routes/encryption.route.js";
import submitRouter from "./routes/submit.route.js";

import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use("/", homeRouter);
app.use("/health", healthRoutes);
app.use("/auth", authRouter);
app.use("/encryption", encryptionRouter);
app.use("/api/submit", submitRouter);

app.use(errorHandler);
