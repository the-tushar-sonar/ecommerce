import express from "express";

import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  updateProductStatusController,
} from "./product.controller.js";

import authenticate from "../../middlewares/auth.middleware.js";
import requireRole from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
} from "./product.validation.js";

import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

// Public routes
router.get("/", asyncHandler(getAllProductsController));

router.get("/:id", asyncHandler(getProductByIdController));

// Admin-only routes
router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createProductSchema),
  asyncHandler(createProductController),
);

router.patch(
  "/:id/status",
  authenticate,
  requireRole("ADMIN"),
  validate(updateProductStatusSchema),
  asyncHandler(updateProductStatusController),
);

router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(updateProductSchema),
  asyncHandler(updateProductController),
);

router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(deleteProductController),
);

export default router;
