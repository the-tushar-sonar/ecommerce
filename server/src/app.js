import express from "express";
import helmet from "helmet";
import cors from "cors";

import routes from "./routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
import requestId from "./middlewares/requestId.middleware.js";
import requestLogger from "./middlewares/requestLogger.middleware.js";

const app = express();

// Global middleware
// Security
app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
}));

// Logging
app.use(requestId);
app.use(requestLogger);

// Body parsing
app.use(express.json({
  limit: "1mb",
}));


// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-commerce API is healthy",
  });
});


// API routes
app.use("/api/v1", routes);


// 404 handler


app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;