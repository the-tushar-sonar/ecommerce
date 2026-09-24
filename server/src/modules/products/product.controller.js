import {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "./product.service.js";

import { productQuerySchema } from "./product.validation.js";

import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const createProductController = async (req, res) => {
  const product = await createProduct(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
};

export const getAllProductsController = async (req, res) => {
  const query = productQuerySchema.parse(req.query);

  const result = await getAllProducts(query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Products fetched successfully"));
};

export const getProductByIdController = async (req, res) => {
  const product = await getProductById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
};

export const updateProductController = async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
};

export const deleteProductController = async (req, res) => {
  const product = await deleteProduct(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
};

export const updateProductStatusController = async (req, res) => {
  const product = await updateProductStatus(req.params.id, req.body.isActive);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product status updated successfully"));
};
