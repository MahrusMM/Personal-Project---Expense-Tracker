from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, expenses, income, categories, budgets, reports, subcategories



models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(income.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(reports.router)
app.include_router(subcategories.router)

@app.get("/")
def read_root():
    return {"message": "Expense Tracker API is running"}


