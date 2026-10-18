import Cart from "./cart.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";

const populateCart = async (cart) => {
  return cart.populate({
    path: "items.product",
    populate: {
      path: "category",
      select: "name description isActive",
    },
  });
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

const getAvailableStock = (product) => {
  return Math.max(0, product.stock - product.reservedStock);
};

const assertAvailableStock = (product, quantity) => {
  const availableStock = getAvailableStock(product);

  if (quantity > availableStock) {
    throw new ApiError(
      400,
      `Only ${availableStock} unit(s) available for ${product.name}`,
    );
  }
};

export const getCartService = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return populateCart(cart);
};

export const addToCartService = async (userId, productId, quantity) => {

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not available");
  }


  let cart = await getOrCreateCart(userId);

  const item = cart.items.find(
    (cartItem) => cartItem.product.toString() === productId,
  );

  const newQuantity = (item?.quantity ?? 0) + quantity;


  assertAvailableStock(product, newQuantity);

  if (item) {
    item.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
    });
  }

  await cart.save();

  return populateCart(cart);
};

export const updateCartItemService = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(
    (cartItem) => cartItem.product.toString() === productId,
  );

  if (!item) {
    throw new ApiError(404, "Product not found in cart");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not available");
  }

  assertAvailableStock(product, quantity);

  item.quantity = quantity;

  await cart.save();

  return populateCart(cart);
};

export const removeFromCartService = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemExists = cart.items.some(
    (cartItem) => cartItem.product.toString() === productId,
  );

  if (!itemExists) {
    throw new ApiError(404, "Product not found in cart");
  }

  cart.items = cart.items.filter(
    (cartItem) => cartItem.product.toString() !== productId,
  );

  await cart.save();

  return populateCart(cart);
};

export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];

  await cart.save();

  return populateCart(cart);
};
