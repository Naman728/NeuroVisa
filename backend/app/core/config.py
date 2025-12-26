from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NeuroVisa"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "changethis-secret-key-for-jwt-tokens-hackathon-mode"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 60 minutes * 24 hours * 8 days = 8 days
    
    
    BACKEND_CORS_ORIGINS: List[str] = []

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
