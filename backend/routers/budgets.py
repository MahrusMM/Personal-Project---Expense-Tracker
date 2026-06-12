from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import security

router = APIRouter(
    prefix="/budgets",
    tags=["budgets"]
)

@router.get("/", response_model=list[schemas.BudgetResponse])
def get_budgets(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    return db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()

@router.post("/", response_model=schemas.BudgetResponse)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    new_budget = models.Budget(
        amount=budget.amount,
        expense_type=budget.expense_type,
        cycle=budget.cycle,
        cycle_start_date=budget.cycle_start_date,
        rollover=budget.rollover,
        initial_rollover=budget.initial_rollover,
        category_id=budget.category_id,
        user_id=current_user.id
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.put("/{budget_id}", response_model=schemas.BudgetResponse)
def update_budget(budget_id: int, budget: schemas.BudgetCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    existing_budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    if not existing_budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    existing_budget.amount = budget.amount
    existing_budget.expense_type = budget.expense_type
    existing_budget.cycle = budget.cycle
    existing_budget.cycle_start_date = budget.cycle_start_date
    existing_budget.rollover = budget.rollover
    existing_budget.initial_rollover = budget.initial_rollover
    existing_budget.category_id = budget.category_id
    db.commit()
    db.refresh(existing_budget)
    return existing_budget

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    existing_budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    if not existing_budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    db.delete(existing_budget)
    db.commit()
    return {"detail": "Budget deleted successfully"}