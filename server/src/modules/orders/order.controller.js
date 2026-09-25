import {
  createOrderService,
  getUserOrdersService,
  getOrderByIdService,
  cancelOrderService,
} from "./order.service.js";

import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const createOrderController = async (req, res) => {
  const order = await createOrderService(
    req.user._id,
    req.body.shippingAddress,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
};

export const getUserOrdersController = async (req, res) => {
  const orders = await getUserOrdersService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
};

export const getOrderByIdController = async (req, res) => {
  const order = await getOrderByIdService(req.params.id, req.user._id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
};

export const cancelOrderController = async (req, res) => {
  const order = await cancelOrderService(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
};
