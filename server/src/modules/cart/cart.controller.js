import ApiResponse from "../../utils/ApiResponse.js";
import {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeFromCartService,
  clearCartService,
} from "./cart.service.js";

export const getCartController = async (req, res) => {
  const cart = await getCartService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
};

export const addToCartController = async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await addToCartService(req.user._id, productId, quantity);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product added to cart successfully"));
};

export const updateCartItemController = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await updateCartItemService(req.user._id, productId, quantity);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item updated successfully"));
};

export const removeFromCartController = async (req, res) => {
  const { productId } = req.params;

  const cart = await removeFromCartService(req.user._id, productId);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product removed from cart successfully"));
};

export const clearCartController = async (req, res) => {
  const cart = await clearCartService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
};
