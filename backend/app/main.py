from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base, engine
from app.api.routes import auth, clubs, members, payments, licenses, equipment, attendances, transactions, messages, sync, employees

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "NovaClub API",
        "version": settings.VERSION,
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(clubs.router, prefix=f"{settings.API_V1_STR}/clubs", tags=["clubs"])
app.include_router(members.router, prefix=f"{settings.API_V1_STR}/members", tags=["members"])
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
app.include_router(licenses.router, prefix=f"{settings.API_V1_STR}/licenses", tags=["licenses"])
app.include_router(equipment.router, prefix=f"{settings.API_V1_STR}/equipment", tags=["equipment"])
app.include_router(attendances.router, prefix=f"{settings.API_V1_STR}/attendances", tags=["attendances"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
app.include_router(messages.router, prefix=f"{settings.API_V1_STR}/messages", tags=["messages"])
app.include_router(sync.router, prefix=f"{settings.API_V1_STR}/sync", tags=["sync"])
app.include_router(employees.router, prefix=f"{settings.API_V1_STR}/employees", tags=["employees"])
