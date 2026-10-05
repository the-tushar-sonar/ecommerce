import redis from "../config/redis.js";

export const setCache = async (key, value, ttl = 300) => {
  await redis.set(key, JSON.stringify(value), {
    EX: ttl,
  });
};

export const getCache = async (key) => {
  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
};

export const deleteCache = async (key) => {
  await redis.del(key);
};

export const deleteCacheByPattern = async (pattern) => {
  let cursor = "0";

  do {
    const result = await redis.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });

    cursor = result.cursor;

    if (result.keys.length > 0) {
      await redis.del(result.keys);
    }
  } while (cursor !== "0");
};
