import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { validate } from "../middleware/validate";
import {
  idParamSchema,
  paginationQuerySchema,
} from "../validators/common.validator";

const router = Router();

// Reports are read-only and public for dashboard consumption.
router.get("/", validate({ query: paginationQuerySchema }), reportController.list);
router.get("/:id", validate({ params: idParamSchema }), reportController.getById);
// Feature 6 — view (inline) or download (?download) the generated HTML report.
router.get("/:id/html", validate({ params: idParamSchema }), reportController.html);

export default router;
