import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Departement(Base):
    __tablename__ = "departements"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    libelle     = Column(String(150), nullable=False)
    description = Column(String(500), nullable=True)

    utilisateur = relationship("Utilisateur", back_populates="departement")