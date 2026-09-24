import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name must not exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Product description is required")
    .max(2000, "Product description must not exceed 2000 characters"),

  price: z.number().min(0, "Price cannot be negative"),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .default(0),

  category: z.string().trim().min(1, "Category is required"),

  imageUrl: z.string().trim().default(""),

  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),

  category: z.string().trim().optional(),

  minPrice: z.coerce
    .number()
    .min(0, "Minimum price cannot be negative")
    .optional(),

  maxPrice: z.coerce
    .number()
    .min(0, "Maximum price cannot be negative")
    .optional(),

  sort: z
    .enum([
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
    ])
    .default("newest"),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateProductStatusSchema = z.object({
  isActive: z.boolean(),
});
