import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { placeOrder } from "./order.controller.js";

const router = Router();

router.post("/", protect, placeOrder);

export default router;
