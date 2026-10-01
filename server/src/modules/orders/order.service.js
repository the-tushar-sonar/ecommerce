import mongoose from "mongoose";
import Order from "./order.model.js";
import Cart from "../cart/cart.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";

export const createOrderService = async (userId, shippingAddress) => {
  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: userId }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
      }

      const orderItems = [];
      let totalAmount = 0;

      for (const cartItem of cart.items) {
        const product = await Product.findOne({
          _id: cartItem.product,
          isActive: true,
        }).session(session);

        if (!product) {
          throw new ApiError(
            400,
            "One or more products are no longer available",
          );
        }

        const availableStock = product.stock - product.reservedStock;

        if (availableStock < cartItem.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for product: ${product.name}`,
          );
        }

        const subtotal = product.price * cartItem.quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: cartItem.quantity,
          subtotal,
        });

        totalAmount += subtotal;
      }

      for (const cartItem of cart.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: cartItem.product,
            isActive: true,
            $expr: {
              $gte: [
                { $subtract: ["$stock", "$reservedStock"] },
                cartItem.quantity,
              ],
            },
          },
          {
            $inc: {
              reservedStock: cartItem.quantity,
            },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );

        if (!updatedProduct) {
          throw new ApiError(
            400,
            "Stock changed while creating the order. Please try again",
          );
        }
      }

      [createdOrder] = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            status: "PLACED",
            paymentStatus: "PENDING",
          },
        ],
        { session },
      );

      cart.items = [];
      await cart.save({ session });
    });

    return createdOrder;
  } finally {
    await session.endSession();
  }
};

export const getUserOrdersService = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getOrderByIdService = async (orderId, userId) => {
  return Order.findOne({
    _id: orderId,
    user: userId,
  });
};

export const cancelOrderService = async (orderId, userId) => {
  const session = await mongoose.startSession();
  try {
    let cancelledOrder;
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId, user: userId }).session(
        session,
      );
      if (!order) {
        throw new ApiError(404, "Order not found");
      }
      if (order.status !== "PLACED") {
        throw new ApiError(400, "Only placed orders can be cancelled");
      }
      for (const item of order.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            $expr: { $gte: ["$reservedStock", item.quantity] },
          },
          { $inc: { reservedStock: -item.quantity } },
          { new: true, session },
        );
        if (!updatedProduct) {
          throw new ApiError(
            400,
            "Unable to release reserved stock for one or more products",
          );
        }
      }
      order.status = "CANCELLED";
      await order.save({ session });
      cancelledOrder = order;
    });
    return cancelledOrder;
  } finally {
    await session.endSession();
  }
};