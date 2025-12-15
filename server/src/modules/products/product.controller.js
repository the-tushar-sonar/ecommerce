import Product from "./product.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

/*
 * CREATE PRODUCT
 * POST /api/products
 * Admin only
 */
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

/* 
  * GET ALL PRODUCTS
  * GET /api/products
  * Public access
  * Only active products are returned 
*/
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

/*
 * UPDATE PRODUCT
 * PATCH /api/products/:id
 * Admin only
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
      new ApiResponse(200, product, "Product updated successfully")
    );
  } catch (error) {
    next(error);
  }
};

/*
 * DELETE PRODUCT (SOFT DELETE)
 * DELETE /api/products/:id
 * Admin only
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
      new ApiResponse(200, null, "Product deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};
