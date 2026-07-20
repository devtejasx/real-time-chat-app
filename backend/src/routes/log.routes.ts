import { Router } from "express";
import { logController } from "../controllers/log.controller";
import { validate } from "../middleware/validate";
import { logQuerySchema } from "../validators/log.validator";

const router = Router();

// Read-only log stream for the Log Viewer (Feature 12).
router.get("/", validate({ query: logQuerySchema }), logController.list);

export default router;
