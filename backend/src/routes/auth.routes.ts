import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);
router.post("/refresh", authLimiter, validate({ body: refreshSchema }), authController.refresh);
router.post("/logout", validate({ body: refreshSchema }), authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
