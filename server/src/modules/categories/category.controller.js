import {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} from "./category.service.js";

export const createCategoryController = async (req, res) => {
  const category = await createCategory(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
};

export const getCategoryByIdController = async (req, res) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

export const getAllCategoriesController = async (req, res) => {
  const categories = await getAllCategories();

  res.status(200).json({
    success: true,
    data: categories,
  });
};

export const updateCategoryController = async (req, res) => {
  const category = await updateCategory(req.params.id, req.body);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

export const deleteCategoryController = async (req, res) => {
  const category = await deleteCategory(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: category,
  });
};

export const updateCategoryStatusController = async (req, res) => {
  const category = await updateCategoryStatus(req.params.id, req.body.isActive);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Category status updated successfully",
    data: category,
  });
};
