from pydantic import BaseModel
from typing import Optional


class CategoryResponse(BaseModel):
    id: int
    name: str
    display_order: int

    class Config:
        from_attributes = True


class MenuResponse(BaseModel):
    id: int
    category_id: int
    name: str
    price: int
    description: Optional[str]
    image_url: Optional[str]
    display_order: int
    is_available: bool

    class Config:
        from_attributes = True
