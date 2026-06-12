from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import security

router = APIRouter(
    prefix="/subcategories",
    tags=["subcategories"]
)

@router.get("/", response_model=list[schemas.SubcategoryResponse])
def get_subcategories(db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    return db.query(models.Subcategory).filter(models.Subcategory.user_id == current_user.id).all()

@router.get("/category/{category_id}", response_model=list[schemas.SubcategoryResponse])
def get_subcategories_by_category(category_id: int, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    return db.query(models.Subcategory).filter(
        models.Subcategory.category_id == category_id,
        models.Subcategory.user_id == current_user.id
    ).all()

@router.post("/", response_model=schemas.SubcategoryResponse)
def create_subcategory(subcategory: schemas.SubcategoryCreate, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    new_sub = models.Subcategory(
        name=subcategory.name,
        category_id=subcategory.category_id,
        user_id=current_user.id
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub

@router.delete("/{subcategory_id}")
def delete_subcategory(subcategory_id: int, db: Session = Depends(get_db), current_user = Depends(security.get_current_user)):
    sub = db.query(models.Subcategory).filter(
        models.Subcategory.id == subcategory_id,
        models.Subcategory.user_id == current_user.id
    ).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
    db.delete(sub)
    db.commit()
    return {"detail": "Subcategory deleted successfully"}