import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import redis from "./config/redis.js";

const startServer = async () => {
  await connectDB();

  await redis.connect();

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

startServer();
