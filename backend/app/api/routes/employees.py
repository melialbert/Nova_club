from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.security import get_password_hash
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from pydantic import BaseModel, EmailStr

router = APIRouter()

class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str = None
    role: str
    password: str

class EmployeeUpdate(BaseModel):
    first_name: str = None
    last_name: str = None
    email: EmailStr = None
    phone: str = None
    role: str = None

@router.get("")
def get_employees(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.role.value if isinstance(current_user.role, UserRole) else current_user.role
    if user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view employees"
        )

    employees = db.query(User).filter(
        User.club_id == current_user.club_id
    ).all()

    return [{
        "id": emp.id,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "email": emp.email,
        "phone": emp.phone,
        "role": emp.role.value if isinstance(emp.role, UserRole) else emp.role,
        "is_active": emp.is_active
    } for emp in employees]

@router.post("")
def create_employee(
    employee: EmployeeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.role.value if isinstance(current_user.role, UserRole) else current_user.role
    if user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create employees"
        )

    existing_user = db.query(User).filter(User.email == employee.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    if employee.role.upper() not in ["ADMIN", "SECRETARY", "COACH"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    hashed_pwd = get_password_hash(employee.password)

    new_employee = User(
        club_id=current_user.club_id,
        email=employee.email,
        hashed_password=hashed_pwd,
        first_name=employee.first_name,
        last_name=employee.last_name,
        phone=employee.phone,
        role=UserRole[employee.role.upper()],
        is_active=True
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {
        "id": new_employee.id,
        "first_name": new_employee.first_name,
        "last_name": new_employee.last_name,
        "email": new_employee.email,
        "phone": new_employee.phone,
        "role": new_employee.role.value if isinstance(new_employee.role, UserRole) else new_employee.role,
        "is_active": new_employee.is_active
    }

@router.put("/{employee_id}")
def update_employee(
    employee_id: str,
    employee: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.role.value if isinstance(current_user.role, UserRole) else current_user.role
    if user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update employees"
        )

    existing_employee = db.query(User).filter(
        User.id == employee_id,
        User.club_id == current_user.club_id
    ).first()

    if not existing_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    if employee.first_name is not None:
        existing_employee.first_name = employee.first_name
    if employee.last_name is not None:
        existing_employee.last_name = employee.last_name
    if employee.email is not None:
        email_exists = db.query(User).filter(
            User.email == employee.email,
            User.id != employee_id
        ).first()
        if email_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        existing_employee.email = employee.email
    if employee.phone is not None:
        existing_employee.phone = employee.phone
    if employee.role is not None:
        if employee.role.upper() not in ["ADMIN", "SECRETARY", "COACH"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role"
            )
        existing_employee.role = UserRole[employee.role.upper()]

    db.commit()
    db.refresh(existing_employee)

    return {
        "id": existing_employee.id,
        "first_name": existing_employee.first_name,
        "last_name": existing_employee.last_name,
        "email": existing_employee.email,
        "phone": existing_employee.phone,
        "role": existing_employee.role.value if isinstance(existing_employee.role, UserRole) else existing_employee.role,
        "is_active": existing_employee.is_active
    }

@router.delete("/{employee_id}")
def delete_employee(
    employee_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.role.value if isinstance(current_user.role, UserRole) else current_user.role
    if user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete employees"
        )

    employee = db.query(User).filter(
        User.id == employee_id,
        User.club_id == current_user.club_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    emp_role = employee.role.value if isinstance(employee.role, UserRole) else employee.role
    if emp_role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete admin users"
        )

    db.delete(employee)
    db.commit()

    return {"message": "Employee deleted successfully"}
