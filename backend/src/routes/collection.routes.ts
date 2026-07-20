import { Router } from "express";
import { collectionController } from "../controllers/collection.controller";
import { validate } from "../middleware/validate";
import { authenticate, authorize } from "../middleware/auth";
import {
  createCollectionSchema,
  updateCollectionSchema,
  listCollectionsQuerySchema,
} from "../validators/collection.validator";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validator";

const router = Router();

// Reads are public so the dashboard can consume them without a session.
router.get("/", validate({ query: listCollectionsQuerySchema }), collectionController.list);
router.get("/:id", validate({ params: idParamSchema }), collectionController.getById);
router.get(
  "/:id/history",
  validate({ params: idParamSchema, query: paginationQuerySchema }),
  collectionController.history,
);

// Managing collections is Admin-only.
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createCollectionSchema }),
  collectionController.create,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: updateCollectionSchema }),
  collectionController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema }),
  collectionController.remove,
);

export default router;
