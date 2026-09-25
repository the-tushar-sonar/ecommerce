import express from "express";

import {
  createOrderController,
  getUserOrdersController,
  getOrderByIdController,
  cancelOrderController,
} from "./order.controller.js";

import authenticate from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import { createOrderSchema } from "./order.validation.js";

const router = express.Router();

// Customer routes
router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  asyncHandler(createOrderController),
);

router.get("/", authenticate, asyncHandler(getUserOrdersController));

router.get("/:id", authenticate, asyncHandler(getOrderByIdController));

router.patch("/:id/cancel", authenticate, asyncHandler(cancelOrderController));

export default router;
