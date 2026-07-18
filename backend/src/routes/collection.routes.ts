import { Router } from "express";
import { collectionController } from "../controllers/collection.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  createCollectionSchema,
  updateCollectionSchema,
  listCollectionsQuerySchema,
} from "../validators/collection.validator";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

// Reads are public so the dashboard can consume them without a session.
router.get("/", validate({ query: listCollectionsQuerySchema }), collectionController.list);
router.get("/:id", validate({ params: idParamSchema }), collectionController.getById);

// Writes require authentication.
router.post(
  "/",
  authenticate,
  validate({ body: createCollectionSchema }),
  collectionController.create,
);
router.put(
  "/:id",
  authenticate,
  validate({ params: idParamSchema, body: updateCollectionSchema }),
  collectionController.update,
);
router.delete(
  "/:id",
  authenticate,
  validate({ params: idParamSchema }),
  collectionController.remove,
);

export default router;
