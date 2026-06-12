from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from datetime import datetime, timedelta
import models
import schemas
import security

router = APIRouter(
    prefix="/reports",
    tags=["reports"] 
)

@router.get("/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)

    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= start_of_month
    ).scalar()
    if total_expenses is None:
        total_expenses = 0.0

    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id,
        models.Income.date >= start_of_month
    ).scalar()
    if total_income is None:
        total_income = 0.0

    total_budget = db.query(func.sum(models.Budget.amount)).filter(
        models.Budget.user_id == current_user.id
    ).scalar()
    if total_budget is None:
        total_budget = 0.0

    available = total_budget - total_expenses

    if total_budget > 0:
        expense_percentage = (total_expenses / total_budget) * 100
    else:
        expense_percentage = 0.0

    return {
        "total_expenses": total_expenses,
        "total_income": total_income,
        "total_budget": total_budget,
        "available": available,
        "expense_percentage": expense_percentage
    }

@router.get("/by-category", response_model=list[schemas.CategorySummary])
def get_by_category(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)

    results = db.query(
        models.Category.name,
        func.sum(models.Expense.amount).label("total")
    ).join(
        models.Expense, models.Expense.category_id == models.Category.id
    ).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= start_of_month
    ).group_by(models.Category.name).all()

    total_all = 0.0
    for r in results:
        total_all = total_all + r.total

    if total_all == 0:
        total_all = 1

    summaries = []
    for r in results:
        percentage = round((r.total / total_all) * 100, 1)
        summary = {
            "category_name": r.name,
            "total_amount": r.total,
            "percentage": percentage
        }
        summaries.append(summary)

    return summaries

@router.get("/summary", response_model=schemas.QuickSummary)
def get_summary(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    now = datetime.utcnow()

    start_of_day = now.replace(hour=0, minute=0, second=0)
    start_of_week = now - timedelta(days=now.weekday())
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)
    start_of_year = now.replace(month=1, day=1, hour=0, minute=0, second=0)

    day_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= start_of_day
    ).scalar()
    if day_expenses is None:
        day_expenses = 0.0

    day_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id,
        models.Income.date >= start_of_day
    ).scalar()
    if day_income is None:
        day_income = 0.0

    week_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= start_of_week
    ).scalar()
    if week_expenses is None:
        week_expenses = 0.0

    week_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id,
        models.Income.date >= start_of_week
    ).scalar()
    if week_income is None:
        week_income = 0.0

    month_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= start_of_month
    ).scalar()
    if month_expenses is None:
        month_expenses = 0.0

    month_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id,
        models.Income.date >= start_of_month
    ).scalar()
    if month_income is None:
        month_income = 0.0

    year_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= start_of_year
    ).scalar()
    if year_expenses is None:
        year_expenses = 0.0

    year_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id,
        models.Income.date >= start_of_year
    ).scalar()
    if year_income is None:
        year_income = 0.0

    return {
        "day_expenses": day_expenses,
        "day_income": day_income,
        "week_expenses": week_expenses,
        "week_income": week_income,
        "month_expenses": month_expenses,
        "month_income": month_income,
        "year_expenses": year_expenses,
        "year_income": year_income
    }

@router.get("/monthly", response_model=list[schemas.MonthlySummary])
def get_monthly(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    results = []
    now = datetime.utcnow()

    for i in range(6):
        month = now.month - i
        year = now.year

        if month <= 0:
            month = month + 12
            year = year - 1

        start = datetime(year, month, 1)

        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        expenses = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.user_id == current_user.id,
            models.Expense.date >= start,
            models.Expense.date < end
        ).scalar()
        if expenses is None:
            expenses = 0.0

        income = db.query(func.sum(models.Income.amount)).filter(
            models.Income.user_id == current_user.id,
            models.Income.date >= start,
            models.Income.date < end
        ).scalar()
        if income is None:
            income = 0.0

        month_data = {
            "month": start.strftime("%b %Y"),
            "total_expenses": expenses,
            "total_income": income
        }
        results.append(month_data)

    return results