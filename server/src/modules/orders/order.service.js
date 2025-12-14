import Cart from "../cart/cart.model.js";
import Order from "./order.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";

export const placeOrderService = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product"
  );
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${item.product.name}`
      );
    }

    item.product.stock -= item.quantity;
    await item.product.save();

    totalAmount += item.product.price * item.quantity;

    orderItems.push({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    });
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalAmount,
  });

  await Cart.findOneAndDelete({ user: userId });

  return order;
};
