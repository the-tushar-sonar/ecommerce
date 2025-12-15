import { Router } from "express";
import { createProduct, getAllProducts, updateProduct, deleteProduct } from "./product.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.post("/", protect, isAdmin, createProduct);
router.patch("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);
router.get("/", getAllProducts);

export default router;
