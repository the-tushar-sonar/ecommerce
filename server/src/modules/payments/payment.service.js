import crypto from "crypto";
import mongoose from "mongoose";

import razorpay from "../../config/razorpay.js";
import Payment from "./payment.model.js";
import Order from "../orders/order.model.js";
import Product from "../products/product.model.js";
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

  // Idempotency:
  // If this payment was already finalized, do not deduct stock again.
  if (payment.status === "PAID") {
    return payment;
  }

  const session = await mongoose.startSession();

  try {
    let verifiedPayment;

    await session.withTransaction(async () => {
      const paymentInTransaction = await Payment.findOne({
        _id: payment._id,
        user: userId,
      }).session(session);

      if (!paymentInTransaction) {
        throw new ApiError(404, "Payment not found");
      }

      // Protect against duplicate verification requests
      // that reach the transaction at the same time.
      if (paymentInTransaction.status === "PAID") {
        verifiedPayment = paymentInTransaction;
        return;
      }

      const order = await Order.findOne({
        _id: paymentInTransaction.order,
        user: userId,
      }).session(session);

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      if (order.status === "CANCELLED") {
        throw new ApiError(
          400,
          "Cannot complete payment for a cancelled order",
        );
      }

      if (order.paymentStatus === "PAID") {
        paymentInTransaction.razorpayPaymentId = razorpayPaymentId;
        paymentInTransaction.razorpaySignature = razorpaySignature;
        paymentInTransaction.status = "PAID";

        await paymentInTransaction.save({ session });

        verifiedPayment = paymentInTransaction;
        return;
      }

      // Finalize inventory:
      // reservedStock decreases and actual stock decreases
      // by the same quantity.
      for (const item of order.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            $expr: {
              $gte: ["$reservedStock", item.quantity],
            },
          },
          {
            $inc: {
              stock: -item.quantity,
              reservedStock: -item.quantity,
            },
          },
          {
            new: true,
            session,
          },
        );

        if (!updatedProduct) {
          throw new ApiError(
            400,
            "Unable to finalize inventory for one or more products",
          );
        }
      }

      paymentInTransaction.razorpayPaymentId = razorpayPaymentId;
      paymentInTransaction.razorpaySignature = razorpaySignature;
      paymentInTransaction.status = "PAID";

      await paymentInTransaction.save({ session });

      order.paymentStatus = "PAID";

      if (order.status === "PLACED") {
        order.status = "CONFIRMED";
      }

      await order.save({ session });

      verifiedPayment = paymentInTransaction;
    });

    return verifiedPayment;
  } finally {
    await session.endSession();
  }
};
