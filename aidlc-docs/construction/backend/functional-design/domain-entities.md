# 도메인 엔티티 - 백엔드

## 엔티티 관계 개요

```
Store (매장)
  |
  +-- Table (테이블) [1:N]
  |     |
  |     +-- Order (주문) [1:N, session_id 기준]
  |     |     |
  |     |     +-- OrderItem (주문 항목) [1:N]
  |     |           |
  |     |           +-- Menu (메뉴) [N:1]
  |     |
  |     +-- OrderHistory (과거 주문) [1:N, 세션 종료 후]
  |           |
  |           +-- OrderHistoryItem (과거 주문 항목) [1:N]
  |
  +-- Category (카테고리) [1:N]
        |
        +-- Menu (메뉴) [1:N]
```

---

## 엔티티 상세 정의

### Store (매장)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| store_id | String(50) | Unique, Not Null | 매장 식별자 (로그인용) |
| name | String(100) | Not Null | 매장명 |
| admin_username | String(50) | Not Null | 관리자 사용자명 |
| admin_password_hash | String(255) | Not Null | bcrypt 해시 비밀번호 |
| created_at | DateTime | Not Null | 생성 시각 |

### Table (테이블)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| store_id | Integer | FK(Store.id) | 소속 매장 |
| table_number | Integer | Not Null | 테이블 번호 |
| password_hash | String(255) | Nullable | bcrypt 해시 비밀번호 (설정 전 null) |
| current_session_id | String(36) | Nullable | 현재 세션 UUID (비활성 시 null) |
| is_active | Boolean | Default True | 활성 여부 |
| created_at | DateTime | Not Null | 생성 시각 |
| **Unique**: (store_id, table_number) | | | |

### Category (카테고리)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| store_id | Integer | FK(Store.id) | 소속 매장 |
| name | String(50) | Not Null | 카테고리명 |
| display_order | Integer | Default 0 | 노출 순서 |

### Menu (메뉴)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| store_id | Integer | FK(Store.id) | 소속 매장 |
| category_id | Integer | FK(Category.id) | 카테고리 |
| name | String(100) | Not Null | 메뉴명 |
| price | Integer | Not Null, >= 0 | 가격 (원) |
| description | Text | Nullable | 메뉴 설명 |
| image_url | String(500) | Nullable | 이미지 URL |
| display_order | Integer | Default 0 | 노출 순서 |
| is_available | Boolean | Default True | 판매 가능 여부 |

### Order (주문)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| order_number | String(20) | Unique, Not Null | 주문 번호 (표시용, 예: ORD-20260318-001) |
| table_id | Integer | FK(Table.id) | 테이블 |
| session_id | String(36) | Not Null | 세션 UUID |
| status | Enum | Not Null | PENDING / PREPARING / COMPLETED |
| total_amount | Integer | Not Null | 총 금액 (원) |
| created_at | DateTime | Not Null | 주문 시각 |

### OrderItem (주문 항목)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| order_id | Integer | FK(Order.id) | 주문 |
| menu_id | Integer | FK(Menu.id) | 메뉴 |
| menu_name | String(100) | Not Null | 주문 시점 메뉴명 (스냅샷) |
| unit_price | Integer | Not Null | 주문 시점 단가 (스냅샷) |
| quantity | Integer | Not Null, >= 1 | 수량 |

### OrderHistory (과거 주문)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| order_number | String(20) | Not Null | 원본 주문 번호 |
| table_id | Integer | FK(Table.id) | 테이블 |
| session_id | String(36) | Not Null | 세션 UUID |
| status | Enum | Not Null | 최종 상태 |
| total_amount | Integer | Not Null | 총 금액 |
| ordered_at | DateTime | Not Null | 원본 주문 시각 |
| completed_at | DateTime | Not Null | 세션 종료(이용 완료) 시각 |

### OrderHistoryItem (과거 주문 항목)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Integer | PK, Auto | 내부 ID |
| order_history_id | Integer | FK(OrderHistory.id) | 과거 주문 |
| menu_name | String(100) | Not Null | 메뉴명 스냅샷 |
| unit_price | Integer | Not Null | 단가 스냅샷 |
| quantity | Integer | Not Null | 수량 |
