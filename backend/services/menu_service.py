from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.store import Store, Category, Menu


def get_categories(db: Session, store: Store) -> list:
    return (
        db.query(Category)
        .filter(Category.store_id == store.id)
        .order_by(Category.display_order)
        .all()
    )


def get_menus(db: Session, store: Store, category_id: int = None) -> list:
    query = db.query(Menu).filter(Menu.store_id == store.id, Menu.is_available == True)
    if category_id is not None:
        query = query.filter(Menu.category_id == category_id)
    return query.order_by(Menu.display_order).all()


def get_menu_or_404(db: Session, store: Store, menu_id: int) -> Menu:
    menu = db.query(Menu).filter(Menu.id == menu_id, Menu.store_id == store.id).first()
    if not menu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="메뉴를 찾을 수 없습니다")
    return menu
