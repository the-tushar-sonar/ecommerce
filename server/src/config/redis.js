import { createClient } from "redis";
import { env } from "./env.js";

const redis = createClient({
  url: env.redisUrl,
});

redis.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redis.on("connect", () => {
  console.log("Redis connecting...");
});

redis.on("ready", () => {
  console.log("Redis connected");
});

export default redis;
