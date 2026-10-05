import { env } from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyPattern || {})[0];

    message = field
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      : "Duplicate value already exists";
  }

  const response = {
    success: false,
    message:
      statusCode === 500 && env.nodeEnv === "production"
        ? "Internal server error"
        : message,
  };

  if (err.errors?.length) {
    response.errors = err.errors;
  }

  if (env.nodeEnv !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
