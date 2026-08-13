from fastapi import FastAPI
from app.api.routes import (
    auth
)

app = FastAPI(title="Gestion de Stock API")

app.include_router(auth.routeur, prefix="/auth", tags=["Authentification"])
