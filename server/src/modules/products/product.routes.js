import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import isAdmin from "../../middlewares/admin.middleware.js";

const router = Router();

router.post("/", protect, isAdmin, (req, res) => {
  res.json({ message: "Product created (admin only)" });
});

router.delete("/:id", protect, isAdmin, (req, res) => {
  res.json({ message: "Product deleted (admin only)" });
});

export default router;
