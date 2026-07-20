import { Router } from "express";
import authRoutes from "./auth.routes";
import collectionRoutes from "./collection.routes";
import executionRoutes from "./execution.routes";
import reportRoutes from "./report.routes";
import dashboardRoutes from "./dashboard.routes";
import infraRoutes from "./infra.routes";
import logRoutes from "./log.routes";
import { sendSuccess } from "../utils/ApiResponse";

const router = Router();

/** Liveness/health probe — public, used by Docker healthchecks and Newman. */
router.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/collections", collectionRoutes);
router.use("/executions", executionRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/logs", logRoutes);
router.use("/", infraRoutes); // /docker and /github

export default router;
