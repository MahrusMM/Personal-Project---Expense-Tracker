from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import security

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

@router.get("/", response_model=list[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    return db.query(models.Category).filter(models.Category.user_id == current_user.id).all()

@router.post("/", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    new_category = models.Category(
        name=category.name,
        icon=category.icon,
        user_id=current_user.id
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    existing_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not existing_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    existing_category.name = category.name
    existing_category.icon = category.icon
    db.commit()
    db.refresh(existing_category)
    return existing_category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    existing_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not existing_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(existing_category)
    db.commit()
    return {"detail": "Category deleted successfully"}