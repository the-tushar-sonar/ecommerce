import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Category description must not exceed 500 characters")
    .default(""),

  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Category description must not exceed 500 characters")
    .optional(),

  isActive: z.boolean().optional(),
});

export const updateCategoryStatusSchema = z.object({
  isActive: z.boolean(),
});
