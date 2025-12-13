import express from "express";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use("/api", routes);
app.use(errorHandler);

export default app;
