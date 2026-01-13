from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "NovaClub API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "postgresql://novaclub:novaclub123@localhost:5432/novaclub_db"
    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str = "novaclub-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://192.168.1.8:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()
