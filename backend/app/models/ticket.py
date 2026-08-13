import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class StatusEnum(str, enum.Enum):
    en_cours = "en cours"
    resolu = "résolu"

class Ticket(Base):
    __tablename__="tickets"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    description = Column(String(500), nullable=True)
    niveau_de_confiance = Column(Float, nullable=True, default = 0.0)
    priorite = Column(Boolean, default=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.en_cours)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    demandeur_id = Column(String, ForeignKey("utilisateurs.id"), nullable=False)
    recepteur_id = Column(String, ForeignKey("utilisateurs.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    # Relations
    demandeur = relationship("Utilisateur", foreign_keys=[demandeur_id],back_populates="tickets_demandes")
    recepteur = relationship("Utilisateur", foreign_keys=[recepteur_id],back_populates="tickets_recus")
    categorie = relationship("Categorie", back_populates="tickets")
    
