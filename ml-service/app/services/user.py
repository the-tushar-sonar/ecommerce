from bson import ObjectId

from app.database.mongodb import db


async def get_user_purchased_product_ids(
    user_id: str,
) -> set[str]:
    if not ObjectId.is_valid(user_id):
        return set()

    cursor = db.orders.find(
        {
            "user": ObjectId(user_id),
            "paymentStatus": "PAID",
        },
        {
            "items.product": 1,
        },
    )

    purchased_product_ids = set()

    async for order in cursor:
        for item in order.get("items", []):
            product_id = item.get("product")

            if product_id:
                purchased_product_ids.add(str(product_id))

    return purchased_product_ids


async def get_user_cart_product_ids(
    user_id: str,
) -> set[str]:
    if not ObjectId.is_valid(user_id):
        return set()

    cart = await db.carts.find_one(
        {
            "user": ObjectId(user_id),
        },
        {
            "items.product": 1,
        },
    )

    if not cart:
        return set()

    cart_product_ids = set()

    for item in cart.get("items", []):
        product_id = item.get("product")

        if product_id:
            cart_product_ids.add(str(product_id))

    return cart_product_ids


async def get_user_behavior_products(
    user_id: str,
) -> dict[str, set[str]]:
    purchased_product_ids = await get_user_purchased_product_ids(user_id)
    cart_product_ids = await get_user_cart_product_ids(user_id)

    return {
        "purchased": purchased_product_ids,
        "cart": cart_product_ids,
    }
