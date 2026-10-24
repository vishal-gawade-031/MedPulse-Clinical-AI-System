import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import mongoose from "mongoose";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { User } from "./models/User";
import { executeSeed } from "./seed/seed";
import routes from "./routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        ENV.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ];
      if (allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Rate limiting on API routes
app.use("/api", apiRateLimiter);

// System Health Check
app.get("/api/health", async (req: Request, res: Response) => {
  let mlServiceStatus = "unreachable";
  try {
    const mlHealth = await axios.get(`${ENV.ML_SERVICE_URL}/health`, {
      timeout: 2000,
    });
    if (mlHealth.data?.status === "ok") {
      mlServiceStatus = "operational";
    }
  } catch (e: any) {
    mlServiceStatus = "offline (using fallback clinical rule engine)";
  }

  const dbState = mongoose.connection.readyState;
  const dbStatuses: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbStatuses[dbState] || "unknown",
      apiServer: "operational",
      mlMicroservice: mlServiceStatus,
    },
    version: "1.0.0",
  });
});

// Mount clinical API routes
app.use("/api", routes);

// Error Handling
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    // Check if the database needs initial seeding (e.g. In-memory demo or fresh MongoDB)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("[*] Database is empty. Auto-seeding initial demo data...");
      await executeSeed();
    }

    app.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(` MedPulse Clinical AI System — Express Backend`);
      console.log(` Running on port: http://localhost:${ENV.PORT}`);
      console.log(` Health Check:    http://localhost:${ENV.PORT}/api/health`);
      console.log(` ML Service URL:  ${ENV.ML_SERVICE_URL}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("[-] Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
