import { Router } from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-commerce API v1",
  });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

export default router;
