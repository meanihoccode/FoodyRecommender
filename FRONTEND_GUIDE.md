# Hướng Dẫn HTML & CSS - Frontend Pages

## 📋 Danh Sách Các Trang Đã Tạo

### 1. **home.html** - Trang Chủ
**Mục đích:** Trang chủ sau khi đăng nhập, hiển thị danh mục phổ biến và nhà hàng nổi bật

**Các phần chính:**
- Hero section: Tìm kiếm nhà hàng/món ăn
- Categories grid: Danh mục nhà hàng phổ biến (phở, cơm, bún, lẩu, nướng, hải sản, đồ uống)
- Featured restaurants: Hiển thị các nhà hàng nổi bật

**Cần code JS để:**
- Fetch danh sách danh mục từ API
- Fetch danh sách nhà hàng từ API
- Xử lý tìm kiếm
- Click vào category → chuyển sang trang restaurants.html

---

### 2. **restaurants.html** - Danh Sách Nhà Hàng
**Mục đích:** Hiển thị tất cả nhà hàng với filter, sort, search

**Các phần chính:**
- Filter theo loại hình (phở, cơm, bún, lẩu, nướng, hải sản, đồ uống)
- Search bar: Tìm kiếm tên nhà hàng
- Sort: Sắp xếp theo tên hoặc giá
- Grid hiển thị nhà hàng

**Card thông tin nhà hàng:**
- Ảnh
- Tên nhà hàng
- Loại hình
- Giá trung bình
- Địa chỉ
- Nút "Xem chi tiết" → chuyển sang restaurant-detail.html

**Cần code JS để:**
- Fetch danh sách nhà hàng từ `/api/restaurants`
- Xử lý filter theo category
- Xử lý search theo tên
- Xử lý sort
- Click vào card → chuyển sang `/restaurant-detail.html?id=<restaurantId>`

---

### 3. **restaurant-detail.html** - Chi Tiết Nhà Hàng & Đặt Bàn
**Mục đích:** Hiển thị chi tiết nhà hàng và form đặt bàn

**Các phần chính:**
1. **Header section:**
   - Ảnh nhà hàng
   - Tên nhà hàng
   - Loại hình
   - Địa chỉ
   - Mô tả
   - Nút "Thêm vào yêu thích" (heart icon)

2. **Booking form:**
   - Ngày đặt (date picker) - yêu cầu
   - Giờ đặt (time picker) - yêu cầu
   - Số người (dropdown) - yêu cầu
   - Tên người đặt - yêu cầu
   - Số điện thoại (10-11 chữ số) - yêu cầu
   - Ghi chú (textarea) - tùy chọn
   - Nút "Xác nhận đặt bàn"

3. **Booking guide sidebar:**
   - Hướng dẫn đặt bàn
   - Liên hệ trực tiếp (gọi/chat)

**Cần code JS để:**
- Lấy restaurantId từ URL query params (`?id=<id>`)
- Fetch thông tin nhà hàng từ `/api/restaurants/{id}`
- Xử lý form submit → POST `/api/reservations`
- Xử lý thêm/xóa yêu thích
- Validate form trước khi submit
- Hiển thị modal thành công

---

### 4. **reservations.html** - Lịch Đặt Bàn
**Mục đích:** Hiển thị lịch sử đặt bàn của người dùng

**Các phần chính:**
- Tab view: Tất cả, Chờ xác nhận, Đã xác nhận, Đã hủy
- Danh sách reservations dưới dạng card:
  - Ảnh nhà hàng
  - Tên nhà hàng
  - Ngày/giờ đặt
  - Số người
  - Trạng thái (badge)
  - Nút "Xem chi tiết" / "Hủy"

**Cần code JS để:**
- Fetch danh sách reservations từ `/api/reservations` (filter by userId)
- Grouping theo status
- Xử lý filter tab
- Xử lý hủy booking (show confirm modal → DELETE API)

---

### 5. **favorites.html** - Nhà Hàng Yêu Thích
**Mục đích:** Hiển thị danh sách nhà hàng đã lưu

**Các phần chính:**
- Search bar
- Sort: Mới thêm nhất, Tên (A-Z), Giá (thấp→cao, cao→thấp)
- Grid nhà hàng yêu thích (tương tự restaurants.html)
- Empty state khi chưa có nhà hàng yêu thích

**Cần code JS để:**
- Fetch danh sách yêu thích từ `/api/user-saved/{userId}`
- Xử lý search
- Xử lý sort
- Xử lý xóa khỏi yêu thích
- Click vào card → chuyển sang restaurant-detail.html

---

### 6. **login.html** - Đăng Nhập
**Mục đích:** Form đăng nhập người dùng

**Các phần chính:**
- Email input
- Password input
- Checkbox "Ghi nhớ tôi"
- Link "Quên mật khẩu?"
- Nút "Đăng nhập"
- Link "Đăng ký ngay"
- Error message display

**Cần code JS để:**
- Validate email/password
- POST `/api/user/login` → lưu userId, email, fullName vào localStorage
- Xử lý error response
- Redirect sang home.html khi thành công

---

## 🎨 CSS Struktur

File **styles.css** đã chứa:
- Variables cho màu sắc, shadow, font
- Responsive design (mobile, tablet, desktop)
- Hover effects, animations
- Component styles (cards, buttons, badges, forms)
- Utilities classes

## 📱 Breakpoints

- Desktop: > 992px
- Tablet: 768px - 992px
- Mobile: < 768px
- Extra small: < 576px

## 🔄 Navigation Flow

```
login.html
    ↓
home.html
    ├─→ restaurants.html
    │   ├─→ restaurant-detail.html (click card)
    │   │   ├─→ Thêm yêu thích → favorites.html
    │   │   └─→ Đặt bàn → reservations.html
    │   └─→ favorites.html
    ├─→ reservations.html
    │   └─→ Hủy booking
    ├─→ favorites.html
    │   ├─→ restaurant-detail.html
    │   └─→ Xóa yêu thích
    └─→ Logout → login.html
```

## ⚙️ API Endpoints Cần Sử Dụng

```
GET    /api/restaurants              - Danh sách nhà hàng
GET    /api/restaurants/{id}         - Chi tiết nhà hàng
GET    /api/user-saved/{userId}      - Danh sách yêu thích
POST   /api/user-saved               - Thêm yêu thích
DELETE /api/user-saved/{userId}/{restaurantId} - Xóa yêu thích
GET    /api/reservations             - Danh sách đặt bàn
POST   /api/reservations             - Tạo đặt bàn
DELETE /api/reservations/{id}        - Hủy đặt bàn
```

## 🎯 Đầu Tiên Cần Code JS

1. **login.js** - Xử lý login + localStorage
2. **restaurants.js** - Load danh sách, filter, search
3. **restaurant-detail.js** - Form booking, yêu thích
4. **reservations.js** - Danh sách booking, hủy
5. **favorites.js** - Danh sách yêu thích

