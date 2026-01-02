"""Репозиторий для работы с пользователями"""
from sqlalchemy.orm import Session
from app.models.user import User
from typing import Optional


class UserRepository:
    """Репозиторий пользователей"""
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Находит пользователя по username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Находит пользователя по ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def create(db: Session, username: str, password_hash: str, email: Optional[str] = None) -> User:
        """Создаёт нового пользователя"""
        user = User(username=username, password_hash=password_hash, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

