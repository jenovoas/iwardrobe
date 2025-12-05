from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, biometrics, recommendation
from app.core.database import engine, Base

app = FastAPI(title="iWARDROBE API", version="3.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router, tags=["auth"])
app.include_router(biometrics.router, tags=["biometrics"])
app.include_router(recommendation.router, tags=["recommendations"])

@app.get("/")
async def root():
    return {"message": "Welcome to iWARDROBE API v3.0"}
