import { Router } from "express";
import { getProfile } from "./user.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", protect, getProfile);

export default router;
