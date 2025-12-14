import { Router } from "express";
import { createProduct, getAllProducts } from "./product.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.post("/", protect, isAdmin, createProduct);
router.get("/", getAllProducts);

export default router;
