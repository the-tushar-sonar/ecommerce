import crypto from "crypto";

import razorpay from "../../config/razorpay.js";
import Payment from "./payment.model.js";
import Order from "../orders/order.model.js";
import ApiError from "../../utils/ApiError.js";
import { env } from "../../config/env.js";

export const createPaymentOrder = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(400, "Cannot pay for a cancelled order");
  }

  if (order.paymentStatus === "PAID") {
    throw new ApiError(400, "Order is already paid");
  }

  const existingPayment = await Payment.findOne({
    order: order._id,
    status: "CREATED",
  });

  if (existingPayment) {
    return existingPayment;
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order._id.toString(),
  });

  const payment = await Payment.create({
    order: order._id,
    user: userId,
    razorpayOrderId: razorpayOrder.id,
    amount: order.totalAmount,
    currency: razorpayOrder.currency,
    status: "CREATED",
  });

  return payment;
};

export const verifyPayment = async (
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  const payment = await Payment.findOne({
    razorpayOrderId,
    user: userId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = "PAID";

  await payment.save();

  const order = await Order.findById(payment.order);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.paymentStatus = "PAID";

  if (order.status === "PLACED") {
    order.status = "PAID";
  }

  await order.save();

  return payment;
};
