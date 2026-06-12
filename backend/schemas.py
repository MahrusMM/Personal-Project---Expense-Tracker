from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# ─── USER SCHEMAS ───────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):         # what frontend sends to register
    password: str

class UserResponse(UserBase):       # what API sends back
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── TOKEN SCHEMAS (for login) ──────────────────────────────

class Token(BaseModel):             # what API sends back after login
    access_token: str
    token_type: str

class TokenData(BaseModel):         # data stored inside the token
    username: Optional[str] = None

# ─── SUBCATEGORY SCHEMAS ───────────────────────────────────────

class SubcategoryBase(BaseModel):
    name: str

class SubcategoryCreate(SubcategoryBase):
    category_id: int

class SubcategoryResponse(SubcategoryBase):
    id: int
    category_id: int
    user_id: int

    class Config:
        from_attributes = True

# ─── CATEGORY SCHEMAS ───────────────────────────────────────

class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None

class CategoryCreate(CategoryBase): # what frontend sends to create
    pass

class CategoryResponse(CategoryBase): # what API sends back
    id: int
    user_id: int
    subcategories: list[SubcategoryResponse] = []

    class Config:
        from_attributes = True

# ─── BUDGET SCHEMAS ─────────────────────────────────────────

class BudgetBase(BaseModel):
    amount: float
    expense_type: str               # Fixed, Variable, Discretionary
    cycle: str                      # Monthly, Weekly
    cycle_start_date: datetime
    rollover: bool = False
    initial_rollover: float = 0.0

class BudgetCreate(BudgetBase):     # what frontend sends to create
    category_id: int

class BudgetResponse(BudgetBase):   # what API sends back
    id: int
    category_id: int
    user_id: int

    class Config:
        from_attributes = True

# ─── EXPENSE SCHEMAS ────────────────────────────────────────

class ExpenseBase(BaseModel):
    amount: float
    date: Optional[datetime] = None
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):   # what frontend sends to create
    category_id: int
    subcategory_id: int

class ExpenseResponse(ExpenseBase): # what API sends back
    id: int
    user_id: int
    category_id: int
    subcategory_id: Optional[int] = None
    category: Optional[CategoryResponse] = None
    subcategory: Optional[SubcategoryResponse] = None

    class Config:
        from_attributes = True

# ─── INCOME SCHEMAS ─────────────────────────────────────────

class IncomeBase(BaseModel):
    amount: float
    description: str
    date: Optional[datetime] = None
    notes: Optional[str] = None

class IncomeCreate(IncomeBase):     # what frontend sends to create
    pass

class IncomeResponse(IncomeBase):   # what API sends back
    id: int
    user_id: int

    class Config:
        from_attributes = True

# ─── REPORT SCHEMAS (for dashboard & charts) ────────────────

class CategorySummary(BaseModel):   # for donut chart (Screen 5)
    category_name: str
    total_amount: float
    percentage: float

class MonthlySummary(BaseModel):    # for cash flow chart (Screen 1)
    month: str
    total_expenses: float
    total_income: float

class QuickSummary(BaseModel):      # for Screen 12
    day_expenses: float
    day_income: float
    week_expenses: float
    week_income: float
    month_expenses: float
    month_income: float
    year_expenses: float
    year_income: float

class DashboardSummary(BaseModel):  # for Screen 1 main tiles
    total_expenses: float
    total_income: float
    total_budget: float
    available: float
    expense_percentage: float