"""
초기 데이터 시드 스크립트
실행: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models.store import Store, Category, Menu
from models.table import Table
from services.auth_service import hash_password

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        # 이미 시드된 경우 스킵
        if db.query(Store).filter(Store.store_id == "demo-store").first():
            print("이미 시드 데이터가 존재합니다. 스킵합니다.")
            return

        # 매장 생성
        store = Store(
            store_id="demo-store",
            name="데모 카페",
            admin_username="admin",
            admin_password_hash=hash_password("admin1234"),
        )
        db.add(store)
        db.flush()

        # 테이블 5개 생성 (비밀번호: table1234)
        table_password = hash_password("table1234")
        for i in range(1, 6):
            db.add(Table(store_id=store.id, table_number=i, password_hash=table_password))

        # 카테고리 3개
        cat_drink = Category(store_id=store.id, name="음료", display_order=1)
        cat_food = Category(store_id=store.id, name="식사", display_order=2)
        cat_dessert = Category(store_id=store.id, name="디저트", display_order=3)
        db.add_all([cat_drink, cat_food, cat_dessert])
        db.flush()

        # 메뉴 10개
        menus = [
            Menu(store_id=store.id, category_id=cat_drink.id, name="아메리카노", price=4500, display_order=1),
            Menu(store_id=store.id, category_id=cat_drink.id, name="카페라떼", price=5000, display_order=2),
            Menu(store_id=store.id, category_id=cat_drink.id, name="녹차라떼", price=5500, display_order=3),
            Menu(store_id=store.id, category_id=cat_drink.id, name="오렌지주스", price=6000, display_order=4),
            Menu(store_id=store.id, category_id=cat_food.id, name="크로크무슈", price=9000, display_order=1),
            Menu(store_id=store.id, category_id=cat_food.id, name="에그베네딕트", price=12000, display_order=2),
            Menu(store_id=store.id, category_id=cat_food.id, name="클럽샌드위치", price=11000, display_order=3),
            Menu(store_id=store.id, category_id=cat_dessert.id, name="티라미수", price=7000, display_order=1),
            Menu(store_id=store.id, category_id=cat_dessert.id, name="치즈케이크", price=7500, display_order=2),
            Menu(store_id=store.id, category_id=cat_dessert.id, name="마카롱 세트", price=8000, display_order=3),
        ]
        db.add_all(menus)
        db.commit()
        print("시드 데이터 삽입 완료!")
        print("  매장 ID: demo-store")
        print("  관리자: admin / admin1234")
        print("  테이블: 1~5번 / 비밀번호: table1234")
    except Exception as e:
        db.rollback()
        print(f"시드 실패: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
