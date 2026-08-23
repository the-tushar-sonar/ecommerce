import express from "express";
import routes from "./routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-commerce API is healthy",
  });
});

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;