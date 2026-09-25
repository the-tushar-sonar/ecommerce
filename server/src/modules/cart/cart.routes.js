import express from "express";

import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from "./cart.controller.js";

import authenticate from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import { addToCartSchema, updateCartItemSchema } from "./cart.validation.js";

import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get current user's cart
router.get("/", asyncHandler(getCartController));

// Add product to cart
router.post("/", validate(addToCartSchema), asyncHandler(addToCartController));

// Update product quantity
router.patch(
  "/:productId",
  validate(updateCartItemSchema),
  asyncHandler(updateCartItemController),
);

// Remove product from cart
router.delete("/:productId", asyncHandler(removeFromCartController));

// Clear entire cart
router.delete("/", asyncHandler(clearCartController));

export default router;
