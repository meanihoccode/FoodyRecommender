# 📝 API TEST GUIDE - POSTMAN

## BASE URL
```
http://localhost:8085/api
```

---

## 🧪 TEST CASES

### 1. USER ENDPOINTS

#### 1.1 Get All Users
```
GET http://localhost:8085/api/user
```
**Expected:** 200 - Array of users

#### 1.2 Get User By ID
```
GET http://localhost:8085/api/user/1
```
**Expected:** 200 - User object

#### 1.3 Login
```
POST http://localhost:8085/api/user/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```
**Expected:** 200 - User object

#### 1.4 Create User
```
POST http://localhost:8085/api/user
Content-Type: application/json

{
  "email": "newuser@example.com",
  "fullName": "New User",
  "password": "password123",
  "phone": "0123456789",
  "isVerified": false
}
```
**Expected:** 201 - No content

#### 1.5 Update User
```
PUT http://localhost:8085/api/user/1
Content-Type: application/json

{
  "email": "updated@example.com",
  "fullName": "Updated User",
  "password": "newpass123",
  "phone": "0987654321",
  "isVerified": true
}
```
**Expected:** 200 - Updated user object

#### 1.6 Delete User
```
DELETE http://localhost:8085/api/user/1
```
**Expected:** 204 - No content

#### 1.7 Change Password
```
PUT http://localhost:8085/api/user/change-password/1
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpass456"
}
```
**Expected:** 200 - User object

---

### 2. RESTAURANT ENDPOINTS

#### 2.1 Get All Restaurants
```
GET http://localhost:8085/api/restaurants
```
**Expected:** 200 - Array of restaurants

#### 2.2 Get Restaurant By ID
```
GET http://localhost:8085/api/restaurants/1
```
**Expected:** 200 - Restaurant object

#### 2.3 Create Restaurant
```
POST http://localhost:8085/api/restaurants
Content-Type: application/json

{
  "name": "Quán Cơm Tấm ABC",
  "description": "Cơm tấm nước mắm cá chua ngon",
  "category": "Vietnamese",
  "priceAverage": "50000",
  "address": "123 Đường Nguyễn Huệ, Q1, HCM",
  "imageUrl": "https://example.com/image.jpg"
}
```
**Expected:** 201 - Restaurant object

#### 2.4 Update Restaurant
```
PUT http://localhost:8085/api/restaurants/1
Content-Type: application/json

{
  "name": "Updated Restaurant",
  "description": "Updated description",
  "category": "Asian",
  "priceAverage": "75000",
  "address": "456 New Street",
  "imageUrl": "https://example.com/new.jpg"
}
```
**Expected:** 200 - Updated restaurant

#### 2.5 Delete Restaurant
```
DELETE http://localhost:8085/api/restaurants/1
```
**Expected:** 204 - No content

---

### 3. RESERVATION ENDPOINTS

#### 3.1 Get All Reservations
```
GET http://localhost:8085/api/reservations
```
**Expected:** 200 - Array of reservations

#### 3.2 Get Reservation By ID
```
GET http://localhost:8085/api/reservations/1
```
**Expected:** 200 - Reservation object

#### 3.3 Create Reservation
```
POST http://localhost:8085/api/reservations
Content-Type: application/json

{
  "user": {
    "id": 1
  },
  "restaurant": {
    "id": 1
  },
  "bookingDate": "2026-03-30",
  "bookingTime": "12:30:00",
  "partySize": 4,
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0123456789",
  "status": "PENDING"
}
```
**Expected:** 201 - Reservation object

#### 3.4 Update Reservation
```
PUT http://localhost:8085/api/reservations/1
Content-Type: application/json

{
  "user": {
    "id": 1
  },
  "restaurant": {
    "id": 1
  },
  "bookingDate": "2026-04-01",
  "bookingTime": "14:00:00",
  "partySize": 6,
  "contactName": "Nguyễn Văn B",
  "contactPhone": "0987654321",
  "status": "CONFIRMED"
}
```
**Expected:** 200 - Updated reservation

#### 3.5 Delete Reservation
```
DELETE http://localhost:8085/api/reservations/1
```
**Expected:** 204 - No content

---

### 4. USER_SAVED ENDPOINTS

#### 4.1 Get Saved Restaurants By User
```
GET http://localhost:8085/api/user-saved/1
```
**Expected:** 200 - Array of restaurants

#### 4.2 Save Restaurant
```
POST http://localhost:8085/api/user-saved
Content-Type: application/json

{
  "user": {
    "id": 1
  },
  "restaurant": {
    "id": 1
  }
}
```
**Expected:** 201 - User_Saved object

#### 4.3 Delete Saved Restaurant
```
DELETE http://localhost:8085/api/user-saved/1/1
```
**Expected:** 204 - No content
(Params: userId=1, restaurantId=1)

---

### 5. RECOMMENDATION ENDPOINTS

#### 5.1 Get All Recommendations
```
GET http://localhost:8085/api/recommendations
```
**Expected:** 200 - Array of recommendations

#### 5.2 Get Recommendations By Restaurant
```
GET http://localhost:8085/api/recommendations/1
```
**Expected:** 200 - Array of recommendations (restaurantId=1)

---

## ✅ EXPECTED RESPONSES

### Success (200-201)
```json
{
  "id": 1,
  "name": "Restaurant Name",
  ...
}
```

### Error (400)
```json
{
  "timestamp": "2026-03-25T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "email: Email không hợp lệ, password: Mật khẩu tối thiểu 6 ký tự"
}
```

### Error (401)
```json
{
  "timestamp": "2026-03-25T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Email hoặc mật khẩu không chính xác"
}
```

### Error (404)
```json
{
  "timestamp": "2026-03-25T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### Error (409)
```json
{
  "timestamp": "2026-03-25T10:30:00",
  "status": 409,
  "error": "Data Integrity Violation",
  "message": "Dữ liệu đã tồn tại (vi phạm unique constraint)"
}
```

---

## 🧑‍💻 TEST ORDER (Priority)

1. ✅ GET /restaurants (test server)
2. ✅ GET /user (test server)
3. ✅ POST /user/login (test auth)
4. ✅ POST /restaurants (test create)
5. ✅ POST /reservations (test relationship)
6. ✅ POST /user-saved (test save)
7. ✅ PUT endpoints (update)
8. ✅ DELETE endpoints (delete)

---

## 🚀 QUICK TEST

Copy paste vào Postman:

**Test 1:**
```
GET http://localhost:8085/api/restaurants
```

**Test 2:**
```
POST http://localhost:8085/api/user/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Test 3:**
```
POST http://localhost:8085/api/restaurants
{
  "name": "Test",
  "description": "Test",
  "category": "Test",
  "priceAverage": "100000",
  "address": "123 Test",
  "imageUrl": "https://test.com/img.jpg"
}
```

---

## 📌 NOTES

- Thay `localhost:8085` bằng domain thực khi deploy
- Sử dụng các ID có sẵn trong DB (hoặc tạo mới trước)
- Format date: `YYYY-MM-DD`
- Format time: `HH:MM:SS`

