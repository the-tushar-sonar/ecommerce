import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z
    .string()
    .trim()
    .min(10, "Shipping address must be at least 10 characters")
    .max(500, "Shipping address must not exceed 500 characters"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});
