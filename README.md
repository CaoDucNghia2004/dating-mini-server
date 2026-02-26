# Dating Mini - Backend Documentation

## Tổ chức hệ thống

### Kiến trúc Backend

```
server/
├── src/
│   ├── constants/        # Hằng số, config, messages
│   ├── controllers/      # Xử lý request/response
│   ├── middlewares/      # Validation, error handling
│   ├── models/           # TypeScript interfaces
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
└── dating.db             # SQLite database
```

### Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT (generated but not enforced)
- **Password:** SHA256 hashing

---

## Lưu trữ dữ liệu

### Database: SQLite

**Lý do chọn SQLite:**

- Đơn giản, không cần setup server riêng
- File-based, dễ backup và di chuyển
- Đủ mạnh cho ứng dụng nhỏ/vừa
- Zero-configuration, phù hợp với demo/prototype
- ACID compliant, đảm bảo tính toàn vẹn dữ liệu

### Database Schema (5 tables):

#### 1. profiles - Thông tin người dùng

```sql
- id (PRIMARY KEY)
- name, age, gender, bio
- email (UNIQUE), password (SHA256)
```

#### 2. likes - Lượt like

```sql
- id (PRIMARY KEY)
- from_user_id → profiles(id)
- to_user_id → profiles(id)
- liked_at (timestamp)
- UNIQUE(from_user_id, to_user_id)
```

#### 3. matches - Cặp đôi match

```sql
- id (PRIMARY KEY)
- user1_id, user2_id → profiles(id)
- matched_at (timestamp)
- CONSTRAINT: user1_id < user2_id (tránh duplicate)
```

#### 4. availabilities - Thời gian rảnh

```sql
- id (PRIMARY KEY)
- user_id → profiles(id)
- match_id → matches(id)
- date, start_time, end_time
```

#### 5. dates - Lịch hẹn đã tìm được

```sql
- id (PRIMARY KEY)
- match_id → matches(id) (UNIQUE)
- date, start_time, end_time
```

---

## Logic Match

### Cơ chế hoạt động:

1. **User A like User B:**
   - Lưu vào bảng `likes` (from_user_id=A, to_user_id=B)
   - Kiểm tra: User B đã like User A chưa?
   - Nếu CHƯA → Trả về `{ isMatch: false }`

2. **User B like User A (sau khi A đã like B):**
   - Lưu vào bảng `likes` (from_user_id=B, to_user_id=A)
   - Kiểm tra: User A đã like User B chưa?
   - Nếu ĐÃ → TẠO MATCH
     - Tạo record trong bảng `matches`
     - `user1_id = min(A, B)`, `user2_id = max(A, B)`
     - Trả về `{ isMatch: true, match_id: X }`

### Đặc điểm:

- Match tự động khi cả 2 bên like nhau
- Không duplicate match (constraint user1_id < user2_id)
- Không thể like 1 người 2 lần (UNIQUE constraint)

---

## Logic tìm Slot trùng

### Quy tắc:

1. Tìm slot đầu tiên có cùng ngày
2. Tính overlap giữa 2 khoảng thời gian
3. Overlap phải >= 30 phút
4. Tự động lưu vào bảng `dates` khi tìm thấy
5. Mỗi match chỉ có 1 date duy nhất (UNIQUE constraint)

### Ví dụ:

```
User A: 10/03/2026, 14:00-17:00
User B: 10/03/2026, 15:00-18:00
→ Overlap: 15:00-17:00 (2 giờ) - Hợp lệ

User A: 10/03/2026, 14:00-14:20
User B: 10/03/2026, 14:15-15:00
→ Overlap: 14:15-14:20 (5 phút) - Không hợp lệ (< 30 phút)
```

---

## Cải thiện trong tương lai

### Nếu có thêm thời gian:

1. **Authentication thực sự**
   - Hiện tại: JWT được generate nhưng không enforce
   - Cải thiện: Middleware kiểm tra token cho mọi protected route

2. **Pagination & Filtering**
   - API `/profile/` trả về tất cả profiles
   - Cải thiện: Thêm limit, offset, filter theo age/gender

3. **Real-time notifications**
   - Hiện tại: Client phải refresh để thấy match mới
   - Cải thiện: WebSocket để notify real-time khi có match

---

## Tính năng đề xuất

### 1. Chat giữa các Match

**Lý do:**

- Sau khi match, user cần giao tiếp để confirm lịch hẹn
- Tăng engagement, giữ user ở trong app lâu hơn
- Cần thiết để thay đổi lịch hẹn nếu có việc đột xuất

### 2. Profile Photos & Gallery

**Lý do:**

- Hiện tại chỉ có text bio, thiếu visual
- Ảnh là yếu tố quan trọng nhất trong dating app
- Tăng tỷ lệ like và match đáng kể

### 3. Reschedule Date

**Lý do:**

- Hiện tại: 1 match chỉ có 1 date cố định
- Thực tế: User có thể bận, cần đổi lịch
- Cần tính năng: Hủy date cũ, chọn lại availability, tìm slot mới

---
