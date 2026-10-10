from decimal import Decimal

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render

from config.mongo import db


@staff_member_required
def overview(request):
    products = db["products"]
    categories = db["categories"]
    users = db["users"]
    orders = db["orders"]
    payments = db["payments"]

    order_statuses = {
        row["_id"]: row["count"]
        for row in orders.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ])
        if row["_id"] is not None
    }

    payment_statuses = {
        row["_id"]: row["count"]
        for row in payments.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ])
        if row["_id"] is not None
    }

    # Payment records are the source for payment revenue.
    # Do not add order totals to this amount, or revenue is double-counted.
    revenue_result = list(payments.aggregate([
        {"$match": {"status": "PAID", "currency": "INR"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]))

    paid_revenue = (
        Decimal(str(revenue_result[0]["total"]))
        if revenue_result else Decimal("0")
    )

    context = {
        "total_products": products.count_documents({}),
        "active_products": products.count_documents({"isActive": True}),
        "total_categories": categories.count_documents({}),
        "total_users": users.count_documents({}),
        "active_users": users.count_documents({"isActive": True}),
        "total_orders": orders.count_documents({}),
        "order_statuses": order_statuses,
        "payment_statuses": payment_statuses,
        "paid_revenue": f"{paid_revenue:,.2f}",
        "zero_stock_products": products.count_documents({
            "isActive": True,
            "stock": {"$lte": 0},
        }),
        "low_stock_products": products.count_documents({
            "isActive": True,
            "stock": {"$gt": 0, "$lte": 5},
        }),
    }

    return render(request, "dashboard/overview.html", context)
