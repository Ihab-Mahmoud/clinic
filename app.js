import * as dotenv from "dotenv";
dotenv.config();

import "express-async-errors";

import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import doctorRouter from "./routes/doctor.js";
import timeSlotRouter from "./routes/timeSlot.js";
import timeBooking from "./routes/booking.js";

import ErrorHandler from "./middlewares/errorHandler.js";
import NotFoundError from "./middlewares/notFound.js";
import { authenticateUser } from "./middlewares/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(express.static(path.resolve(__dirname, "./client/dist")));
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(mongoSanitize());

  // routes
  app.use("/api/v1/user", authenticateUser, userRouter);
  app.use("/api/v1/doctor", doctorRouter);
  app.use("/api/v1/timeSlot", timeSlotRouter);
  app.use("/api/v1/booking", timeBooking);
  app.use("/api/v1", authRouter);
  app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
  });

  // error handler
  app.use(NotFoundError);
  app.use(ErrorHandler);

  return app;
}

const app = createApp();

export default app;
