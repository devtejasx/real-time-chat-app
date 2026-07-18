import { Router } from "express";
import { executionController } from "../controllers/execution.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  runExecutionSchema,
  listExecutionsQuerySchema,
} from "../validators/execution.validator";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

// Triggering a run mutates state — require authentication.
router.post("/run", authenticate, validate({ body: runExecutionSchema }), executionController.run);

// Reads are public.
router.get("/", validate({ query: listExecutionsQuerySchema }), executionController.list);
router.get("/:id", validate({ params: idParamSchema }), executionController.getById);

export default router;
