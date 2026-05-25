import express, { Request, Response } from "express";
import cors from "cors";
import projectRoutes from "./routes/projects";
import riskRoutes from "./routes/risks";
import issueRoutes from "./routes/issues";
import scopeChangeRoutes from "./routes/scopeChanges";
import benefitRoutes from "./routes/benefits";
import grantMilestoneRoutes from "./routes/grantMilestones";
import dashboardRoutes from "./routes/dashboard";

const app = express();

// CORS — allow local dev + deployed frontend (set FRONTEND_URL in Railway env vars)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.use("/api/projects",        projectRoutes);
app.use("/api/risks",           riskRoutes);
app.use("/api/issues",          issueRoutes);
app.use("/api/scope-changes",   scopeChangeRoutes);
app.use("/api/benefits",        benefitRoutes);
app.use("/api/grant-milestones",grantMilestoneRoutes);
app.use("/api/dashboard",       dashboardRoutes);

export default app;
