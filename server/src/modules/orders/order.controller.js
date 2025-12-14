import { placeOrderService } from "./order.service.js";

export const placeOrder = async (req, res) => {
  const order = await placeOrderService(req.user.userId);
  res.status(201).json(order);
};
