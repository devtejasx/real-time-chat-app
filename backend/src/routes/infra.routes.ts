import { Router } from "express";
import { infraController } from "../controllers/infra.controller";

const router = Router();

// Public infrastructure status endpoints (mounted at /api).
router.get("/docker", infraController.docker);
router.get("/github", infraController.github);

export default router;
