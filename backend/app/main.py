from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth
)

app = FastAPI(title="Gestion de Stock API")

app.include_router(auth.routeur, prefix="/auth", tags=["Authentification"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # l'origine de ton frontend (Next.js en dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
