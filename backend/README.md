# mAIntenance & Assistance - AI Support Agent

Prototype d'agent d'assistance informatique automatisé

## Stack Technique
- **LLM**: gemini-2.5-flash
- **Backend API**: FastAPI / Uvicorn
- **Validation Data**: Pydantic v2
- **RAG & Vector Store**: ChromaDB
- **Sécurité**: Garde-fous Regex & Analyse Contextuelle

## Lancement Rapide

1. **Installer les dépendances :**
```bash
cd backend
python -m venv venv     
pip install -r requirements.txt
```
2. **Test classifier :**
```bash
python -m tests.test_checkpoint
```

3. **Demarrarer le serveur :**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000    
```