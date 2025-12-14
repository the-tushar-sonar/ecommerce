import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "./cart.controller.js";

const router = Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/:productId", removeFromCart);

export default router;
