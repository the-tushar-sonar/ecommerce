import Product from "./product.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !price) {
      throw new ApiError(400, "Name and price are required");
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true });

    return res
      .status(200)
      .json(new ApiResponse(200, products));
  } catch (error) {
    next(error);
  }
};
