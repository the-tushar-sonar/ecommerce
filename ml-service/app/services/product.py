from bson import ObjectId

from app.database.mongodb import db


async def get_active_products(limit: int = 10):
    cursor = db.products.find(
        {
            "isActive": True,
            "stock": {"$gt": 0},
        },
        {
            "_id": 1,
            "name": 1,
            "description": 1,
            "price": 1,
            "category": 1,
            "stock": 1,
        },
    ).limit(limit)

    products = []

    async for product in cursor:
        products.append(
            {
                "product_id": str(product["_id"]),
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "category": str(product["category"]),
                "stock": product["stock"],
            }
        )

    return products


async def get_active_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        return None

    product = await db.products.find_one(
        {
            "_id": ObjectId(product_id),
            "isActive": True,
            "stock": {"$gt": 0},
        },
        {
            "_id": 1,
            "name": 1,
            "description": 1,
            "price": 1,
            "category": 1,
            "stock": 1,
        },
    )

    if not product:
        return None

    return {
        "product_id": str(product["_id"]),
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "category": str(product["category"]),
        "stock": product["stock"],
    }
