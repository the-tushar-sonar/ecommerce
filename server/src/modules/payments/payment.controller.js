import { createPaymentOrder, verifyPayment } from "./payment.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const createPaymentOrderController = async (req, res) => {
  const payment = await createPaymentOrder(req.user._id, req.body.orderId);

  return res
    .status(201)
    .json(new ApiResponse(201, payment, "Payment order created successfully"));
};

export const verifyPaymentController = async (req, res) => {
  const payment = await verifyPayment(
    req.user._id,
    req.body.razorpayOrderId,
    req.body.razorpayPaymentId,
    req.body.razorpaySignature,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment verified successfully"));
};
