from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import security

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"]
)

@router.get("/",response_model=list[schemas.ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user = Depends(security.get_current_user)
):
    expenses=db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).all()

    return expenses

@router.post("/",response_model=schemas.ExpenseResponse)
def create_expenses(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(security.get_current_user)
):
    new_expense = models.Expense(
    amount=expense.amount,
    subcategory_id=expense.subcategory_id,
    date=expense.date,
    notes=expense.notes,
    category_id=expense.category_id,
    user_id=current_user.id
    )
    
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.put("/{expense_id}",response_model=schemas.ExpenseResponse)
def update_expenses(
    expense_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(security.get_current_user)
):
    existing_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not existing_expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    existing_expense.amount = expense.amount
    existing_expense.description = expense.description
    existing_expense.date = expense.date
    existing_expense.notes = expense.notes
    existing_expense.category_id = expense.category_id

    db.commit()
    db.refresh(existing_expense)
    return existing_expense

@router.delete("/{expense_id}")
def delete_expenses(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(security.get_current_user)
):
    existing_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not existing_expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    db.delete(existing_expense)
    db.commit()
    return {"detail": "Expense deleted successfully"}
