import express from "express";
import {
  createCategoryController,
  getCategoryByIdController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
  updateCategoryStatusController,
} from "./category.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from "./category.validation.js";
import authenticate from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.get("/", getAllCategoriesController);

router.get("/:id", getCategoryByIdController);

router.post(
  "/",
  authenticate,
  isAdmin,
  validate(createCategorySchema),
  createCategoryController,
);

router.patch(
  "/:id",
  authenticate,
  isAdmin,
  validate(updateCategorySchema),
  updateCategoryController,
);

router.patch(
  "/:id/status",
  authenticate,
  isAdmin,
  validate(updateCategoryStatusSchema),
  updateCategoryStatusController,
);

router.delete("/:id", authenticate, isAdmin, deleteCategoryController);

export default router;
