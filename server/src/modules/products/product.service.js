import Product from "./product.model.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} from "../../utils/redis.js";

const buildProductListCacheKey = (query) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = query;

  const params = new URLSearchParams();

  if (search !== undefined) params.set("search", search);
  if (category !== undefined) params.set("category", category);
  if (minPrice !== undefined) params.set("minPrice", String(minPrice));
  if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));

  params.set("sort", sort);
  params.set("page", String(page));
  params.set("limit", String(limit));

  return `products:list:${params.toString()}`;
};

export const createProduct = async (data) => {
  const product = await Product.create(data);

  await deleteCacheByPattern("products:list:*");

  return product;
};

export const getProductById = async (id) => {
  const cacheKey = `product:${id}`;

  const cachedProduct = await getCache(cacheKey);

  if (cachedProduct) {
    return cachedProduct;
  }

  const product = await Product.findById(id);

  if (product) {
    await setCache(cacheKey, product.toObject(), 300);
  }

  return product;
};

export const getAllProducts = async (query) => {
  const cacheKey = buildProductListCacheKey(query);

  const cachedProducts = await getCache(cacheKey);

  if (cachedProducts) {
    return cachedProducts;
  }

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

  const result = {
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

  await setCache(cacheKey, result, 120);

  return result;
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (product) {
    await deleteCache(`product:${id}`);
    await deleteCacheByPattern("products:list:*");
  }

  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);

  if (product) {
    await deleteCache(`product:${id}`);
    await deleteCacheByPattern("products:list:*");
  }

  return product;
};

export const updateProductStatus = async (id, isActive) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive },
    {
      new: true,
      runValidators: true,
    },
  );

  if (product) {
    await deleteCache(`product:${id}`);
    await deleteCacheByPattern("products:list:*");
  }

  return product;
};
