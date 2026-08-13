import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Categorie(Base):
    __tablename__ = "categories"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    libelle     = Column(String(150), nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tickets = relationship("Ticket", back_populates="categorie")