import {
  getCartService,
  addToCartService,
  removeFromCartService,
} from "./cart.service.js";

export const getCart = async (req, res) => {
  const cart = await getCartService(req.user.userId);
  res.json(cart || { items: [] });
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await addToCartService(
    req.user.userId,
    productId,
    quantity
  );
  res.status(201).json(cart);
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const cart = await removeFromCartService(req.user.userId, productId);
  res.json(cart);
};
