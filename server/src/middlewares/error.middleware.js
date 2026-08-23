import { env } from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message:
      statusCode === 500 && env.nodeEnv === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
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