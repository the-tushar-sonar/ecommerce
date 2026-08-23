import "dotenv/config";

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGO_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  redisUrl:
    process.env.REDIS_URL || "redis://localhost:6379",

  mlServiceUrl:
    process.env.ML_SERVICE_URL ||
    "http://localhost:8000",

  djangoAdminUrl:
    process.env.DJANGO_ADMIN_URL ||
    "http://localhost:8001",
};