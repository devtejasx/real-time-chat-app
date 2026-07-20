import { Router } from "express";
import { executionController } from "../controllers/execution.controller";
import { validate } from "../middleware/validate";
import { authenticate, authorize } from "../middleware/auth";
import {
  runExecutionSchema,
  listExecutionsQuerySchema,
} from "../validators/execution.validator";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

// Running a collection is allowed for Admins and Testers.
router.post(
  "/run",
  authenticate,
  authorize("ADMIN", "TESTER"),
  validate({ body: runExecutionSchema }),
  executionController.run,
);

// Reads are public (Viewers included).
router.get("/", validate({ query: listExecutionsQuerySchema }), executionController.list);
router.get("/:id", validate({ params: idParamSchema }), executionController.getById);

// Deleting an execution is Admin-only.
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema }),
  executionController.remove,
);

export default router;
