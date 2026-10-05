import Category from "./category.model.js";
import Product from "../products/product.model.js";
import { deleteCache, deleteCacheByPattern } from "../../utils/redis.js";

const invalidateCategoryProductCache = async (categoryId) => {
  const products = await Product.find({
    category: categoryId,
  }).select("_id");

  for (const product of products) {
    await deleteCache(`product:${product._id}`);
  }

  await deleteCacheByPattern("products:list:*");
};

export const createCategory = async (data) => {
  const category = await Category.create(data);

  return category;
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  return category;
};

export const getAllCategories = async () => {
  const categories = await Category.find().sort({ name: 1 });

  return categories;
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (category) {
    await invalidateCategoryProductCache(id);
  }

  return category;
};

export const deleteCategory = async (id) => {
  const productsUsingCategory = await Product.exists({
    category: id,
  });

  if (productsUsingCategory) {
    const error = new Error(
      "Cannot delete category while products are assigned to it",
    );
    error.statusCode = 409;
    throw error;
  }

  const category = await Category.findByIdAndDelete(id);

  return category;
};

export const updateCategoryStatus = async (id, isActive) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { isActive },
    {
      new: true,
      runValidators: true,
    },
  );

  if (category) {
    await invalidateCategoryProductCache(id);
  }

  return category;
};
