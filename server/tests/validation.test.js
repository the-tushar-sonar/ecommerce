import test from "node:test";
import assert from "node:assert/strict";

import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  updateProductStatusSchema,
} from "../src/modules/products/product.validation.js";

import {
  addToCartSchema,
  updateCartItemSchema,
} from "../src/modules/cart/cart.validation.js";

import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../src/modules/orders/order.validation.js";

const validCategoryId = "6ac3ff1bbfd5e70dee763160";

test("product creation trims strings and applies defaults", () => {
  const result = createProductSchema.safeParse({
    name: "  Wireless Mouse  ",
    description: "  Ergonomic wireless mouse  ",
    price: 499,
    category: validCategoryId,
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.name, "Wireless Mouse");
    assert.equal(result.data.description, "Ergonomic wireless mouse");
    assert.equal(result.data.stock, 0);
    assert.equal(result.data.imageUrl, "");
    assert.equal(result.data.isActive, true);
  }
});

test("product creation rejects negative price", () => {
  const result = createProductSchema.safeParse({
    name: "Mouse",
    description: "Wireless mouse",
    price: -1,
    category: validCategoryId,
  });

  assert.equal(result.success, false);
});

test("product creation rejects fractional stock", () => {
  const result = createProductSchema.safeParse({
    name: "Mouse",
    description: "Wireless mouse",
    price: 499,
    stock: 1.5,
    category: validCategoryId,
  });

  assert.equal(result.success, false);
});

test("product creation rejects an invalid category ID", () => {
  const result = createProductSchema.safeParse({
    name: "Mouse",
    description: "Wireless mouse",
    price: 499,
    category: "abc",
  });

  assert.equal(result.success, false);
});

test("product query coerces numeric query values and applies defaults", () => {
  const result = productQuerySchema.safeParse({
    page: "2",
    limit: "25",
    minPrice: "100",
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.page, 2);
    assert.equal(result.data.limit, 25);
    assert.equal(result.data.minPrice, 100);
    assert.equal(result.data.sort, "newest");
  }
});

test("product query rejects limit above 100", () => {
  const result = productQuerySchema.safeParse({
    limit: "101",
  });

  assert.equal(result.success, false);
});

test("partial product update accepts a single field", () => {
  const result = updateProductSchema.safeParse({
    price: 299,
  });

  assert.equal(result.success, true);
});

test("product status requires a boolean", () => {
  assert.equal(
    updateProductStatusSchema.safeParse({ isActive: false }).success,
    true,
  );

  assert.equal(
    updateProductStatusSchema.safeParse({ isActive: "false" }).success,
    false,
  );
});

test("cart rejects a quantity below one", () => {
  const result = addToCartSchema.safeParse({
    productId: validCategoryId,
    quantity: 0,
  });

  assert.equal(result.success, false);
});

test("cart rejects a fractional quantity", () => {
  const result = updateCartItemSchema.safeParse({
    quantity: 1.5,
  });

  assert.equal(result.success, false);
});

test("cart accepts a positive integer quantity", () => {
  const result = addToCartSchema.safeParse({
    productId: validCategoryId,
    quantity: 2,
  });

  assert.equal(result.success, true);
});

test("order requires a sufficiently long shipping address", () => {
  assert.equal(
    createOrderSchema.safeParse({
      shippingAddress: "123 Main Street, Mumbai",
    }).success,
    true,
  );

  assert.equal(
    createOrderSchema.safeParse({
      shippingAddress: "Short",
    }).success,
    false,
  );
});

test("order status accepts only supported values", () => {
  assert.equal(
    updateOrderStatusSchema.safeParse({
      status: "SHIPPED",
    }).success,
    true,
  );

  assert.equal(
    updateOrderStatusSchema.safeParse({
      status: "PENDING",
    }).success,
    false,
  );
});
