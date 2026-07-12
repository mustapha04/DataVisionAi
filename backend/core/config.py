from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    secret_key: str = "predictiq-secret"
    debug: bool = True
    openrouter_api_key: str = ""
    groq_api_key: str = ""
    gemini_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
