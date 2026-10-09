import { Router } from "express";

import authenticate from "../../middlewares/auth.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { getRecommendationsController } from "./recommendation.controller.js";

const router = Router();

router.use(authenticate);

router.get("/:productId", asyncHandler(getRecommendationsController));

export default router;
