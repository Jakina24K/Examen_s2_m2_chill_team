from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email : str
    mot_de_passe : str

class LoginResponse(BaseModel):
    token : str
    role : str
    
    class Config:
        from_attributes = True

class RegisterRequest(BaseModel):
    nom: str
    prenom: str 
    matricule: str
    email: str
    mot_de_passe: str
    telephone: Optional[str] = None

class RegisterResponse(BaseModel):
    id: str
    nom: str
    prenom: str
    
    class Config:
        from_attributes = True

class CurrentUserResponse(BaseModel):
    id: str
    nom: str
    prenom: str
    role: str
    
    class Config:
        from_attributes = True

