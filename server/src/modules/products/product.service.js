import Product from "./product.model.js";

export const createProduct = async (data) => {
  return Product.create(data);
};

export const getProductById = async (id) => {
  return Product.findById(id);
};

export const getAllProducts = async (query) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = query;

  const filter = { isActive: true };

  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
  };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOptions[sort]).skip(skip).limit(limit),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
};

export const updateProduct = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteProduct = async (id) => {
  return Product.findByIdAndDelete(id);
};

export const updateProductStatus = async (id, isActive) => {
  return Product.findByIdAndUpdate(
    id,
    { isActive },
    {
      new: true,
      runValidators: true,
    },
  );
};
