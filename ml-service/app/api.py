from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database.mongodb import close_mongodb, db
from app.routes.recommendation import router as recommendation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.command("ping")
    print("MongoDB connected")

    yield

    await close_mongodb()
    print("MongoDB connection closed")


app = FastAPI(
    title="E-Commerce ML Recommendation Service",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ml-recommendation-service",
    }


@app.get("/health/db")
async def database_health_check():
    await db.command("ping")

    return {
        "status": "healthy",
        "database": "connected",
    }



app.include_router(recommendation_router)
