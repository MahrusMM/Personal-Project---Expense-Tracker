from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import security

router = APIRouter(
    prefix="/income",
    tags=["income"]
)

@router.get("/", response_model=list[schemas.IncomeResponse])
def get_income(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    return db.query(models.Income).filter(models.Income.user_id == current_user.id).all()

@router.post("/", response_model=schemas.IncomeResponse)
def create_income(income: schemas.IncomeCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    new_income = models.Income(
        amount=income.amount,
        description=income.description,
        date=income.date,
        notes=income.notes,
        user_id=current_user.id
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income

@router.put("/{income_id}", response_model=schemas.IncomeResponse)
def update_income(income_id: int, income: schemas.IncomeCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    existing_income = db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == current_user.id
    ).first()
    if not existing_income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")
    existing_income.amount = income.amount
    existing_income.description = income.description
    existing_income.date = income.date
    existing_income.notes = income.notes
    db.commit()
    db.refresh(existing_income)
    return existing_income

@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    existing_income = db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == current_user.id
    ).first()
    if not existing_income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")
    db.delete(existing_income)
    db.commit()
    return {"detail": "Income deleted successfully"}