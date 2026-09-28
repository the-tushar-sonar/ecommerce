import express from "express";

import {
  createPaymentOrderController,
  verifyPaymentController,
} from "./payment.controller.js";

import authenticate from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from "./payment.validation.js";

import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

router.post(
  "/create-order",
  authenticate,
  validate(createPaymentOrderSchema),
  asyncHandler(createPaymentOrderController),
);

router.post(
  "/verify",
  authenticate,
  validate(verifyPaymentSchema),
  asyncHandler(verifyPaymentController),
);

export default router;
