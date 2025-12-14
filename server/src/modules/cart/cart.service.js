import Cart from "./cart.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";

export const getCartService = async (userId) => {
  return await Cart.findOne({ user: userId }).populate("items.product");
};

export const addToCartService = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not available");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
    return cart;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return cart;
};

export const removeFromCartService = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  return cart;
};

export const clearCartService = async (userId) => {
  await Cart.findOneAndDelete({ user: userId });
};
