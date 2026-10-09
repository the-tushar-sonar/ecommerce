import os

from pymongo import AsyncMongoClient

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017/ecommerce",
)

client = AsyncMongoClient(MONGO_URI)
db = client.get_default_database()


async def close_mongodb():
    await client.close()
