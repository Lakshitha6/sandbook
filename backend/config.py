from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Database settings
    database_hostname: str = os.getenv("DATABASE_HOSTNAME", "")
    database_port: str = os.getenv("DATABASE_PORT", "")
    database_username: str = os.getenv("DATABASE_USERNAME", "")
    database_password: str = os.getenv("DATABASE_PASSWORD", "")
    database_name: str = os.getenv("DATABASE_NAME", "")
    secret_key: str = os.getenv("SECRET_KEY", "")
    algorithm: str = os.getenv("ALGORITHM", "")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    class Config:
        env_file = ".env"

settings = Settings()