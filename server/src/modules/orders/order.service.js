import Order from "./order.model.js";
import Cart from "../cart/cart.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";

export const createOrderService = async (userId, shippingAddress) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);

    if (!product || !product.isActive) {
      throw new ApiError(400, "One or more products are no longer available");
    }

    if (product.stock < cartItem.quantity) {
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

  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalAmount,
    shippingAddress,
    status: "PLACED",
    paymentStatus: "PENDING",
  });

  for (const cartItem of cart.items) {
    await Product.findByIdAndUpdate(
      cartItem.product,
      {
        $inc: {
          stock: -cartItem.quantity,
        },
      },
      {
        runValidators: true,
      },
    );
  }

  cart.items = [];
  await cart.save();

  return order;
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
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "PLACED") {
    throw new ApiError(400, "Only placed orders can be cancelled");
  }

  order.status = "CANCELLED";

  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        stock: item.quantity,
      },
    });
  }

  return order;
};
