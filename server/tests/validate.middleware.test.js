import test from "node:test";
import assert from "node:assert/strict";

import validate from "../src/middlewares/validate.middleware.js";
import ApiError from "../src/utils/ApiError.js";
import { createProductSchema } from "../src/modules/products/product.validation.js";

test("valid input is parsed and passed to the next middleware", () => {
  const req = {
    body: {
      name: "  Wireless Mouse  ",
      description: "  Ergonomic mouse  ",
      price: 499,
      category: "6ac3ff1bbfd5e70dee763160",
    },
  };

  let nextCalled = false;

  validate(createProductSchema)(req, {}, (error) => {
    assert.equal(error, undefined);
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.body.name, "Wireless Mouse");
  assert.equal(req.body.description, "Ergonomic mouse");
  assert.equal(req.body.stock, 0);
  assert.equal(req.body.imageUrl, "");
  assert.equal(req.body.isActive, true);
});

test("invalid input forwards an ApiError with status 400", () => {
  const req = {
    body: {
      name: "M",
      description: "",
      price: -1,
      category: "abc",
    },
  };

  let receivedError;

  validate(createProductSchema)(req, {}, (error) => {
    receivedError = error;
  });

  assert.ok(receivedError instanceof ApiError);
  assert.equal(receivedError.statusCode, 400);
  assert.equal(receivedError.message, "Validation failed");
  assert.ok(receivedError.errors.length > 0);
});

test("validation errors include field paths and messages", () => {
  const req = {
    body: {
      name: "M",
      description: "Valid description",
      price: 100,
      category: "invalid",
    },
  };

  let receivedError;

  validate(createProductSchema)(req, {}, (error) => {
    receivedError = error;
  });

  assert.ok(receivedError instanceof ApiError);

  assert.ok(
    receivedError.errors.some(
      (error) =>
        error.field === "name" &&
        error.message === "Product name must be at least 2 characters",
    ),
  );

  assert.ok(
    receivedError.errors.some(
      (error) =>
        error.field === "category" &&
        error.message === "Invalid category ID",
    ),
  );
});

test("invalid input does not call next without an error", () => {
  const req = {
    body: {
      name: "",
      description: "",
      price: -1,
      category: "abc",
    },
  };

  let nextCalled = false;
  let receivedError;

  validate(createProductSchema)(req, {}, (error) => {
    nextCalled = true;
    receivedError = error;
  });

  assert.equal(nextCalled, true);
  assert.ok(receivedError instanceof ApiError);
});
