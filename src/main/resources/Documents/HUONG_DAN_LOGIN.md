# 📋 HƯỚNG DẪN PHÁT TRIỂN PHẦN LOGIN CHI TIẾT

## 📌 Tổng Quan Hệ Thống
Phần login bao gồm 3 tầng:
1. **Frontend (HTML/CSS/JS)** - Giao diện người dùng
2. **Backend API (Java/Spring Boot)** - Xử lý logic đăng nhập
3. **Database (MySQL)** - Lưu trữ thông tin user

---

## 🏗️ PHẦN 1: CẤU TRÚC PROJECT HIỆN TẠI

### Cấu trúc thư mục:
```
src/main/
├── java/com/example/foodyrecommender/
│   ├── api/
│   │   └── UserController.java      ← API Endpoints
│   ├── entity/
│   │   └── User.java                ← Model User
│   ├── repository/
│   │   └── UserRepository.java       ← Database Access
│   ├── service/
│   │   └── UserService.java          ← Business Logic
│   ├── config/
│   │   └── SecurityConfig.java       ← Security Configuration
│   └── FoodyRecommenderApplication.java
└── resources/
    ├── html/
    │   ├── login.html                ← Form Đăng nhập
    │   └── signup.html               ← Form Đăng ký
    ├── js/
    │   ├── login.js                  ← Logic Đăng nhập
    │   └── signup.js                 ← Logic Đăng ký
    └── css/
        └── (CSS files)
```

### Entity User (Database):
```
Bảng: users
- id (INT, Primary Key, Auto Increment)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- full_name (VARCHAR(255))
- password (VARCHAR(255), Hashed)
- phone (VARCHAR(20))
- is_verified (BOOLEAN, Default: false)
- created_at (TIMESTAMP, Default: CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, Default: CURRENT_TIMESTAMP)
```

---

## 🔧 PHẦN 2: FIX LỖI LOGIC LOGIN

### ⚠️ Vấn đề Hiện Tại trong `UserController.java`:

**Lỗi 1: Login method không kiểm tra đúng password**
```java
// ❌ SAI - So sánh hash lại password
if (loggedUser != null && passwordEncoder.encode(loggedUser.getPassword()).equals(user.getPassword())) {
```

**Lỗi 2: Không xử lý trường hợp user không tồn tại hoặc email sai**

### ✅ CẬP NHẬT Login Endpoint:

**File:** `src/main/java/com/example/foodyrecommender/api/UserController.java`

Thay thế phương thức `login()` bằng:
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    // Tìm user theo email
    User user = userService.findByEmail(loginRequest.getEmail());
    
    // Kiểm tra user có tồn tại không
    if (user == null) {
        return ResponseEntity.status(401).body(new ErrorResponse("Email không tồn tại"));
    }
    
    // Kiểm tra password có khớp không (compare thay vì encode lại)
    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
        return ResponseEntity.status(401).body(new ErrorResponse("Mật khẩu không chính xác"));
    }
    
    // Login thành công
    return ResponseEntity.ok(user);
}
```

### Tạo Class `LoginRequest`:

**File:** `src/main/java/com/example/foodyrecommender/dto/LoginRequest.java`
```java
package com.example.foodyrecommender.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
```

### Tạo Class `ErrorResponse`:

**File:** `src/main/java/com/example/foodyrecommender/dto/ErrorResponse.java`
```java
package com.example.foodyrecommender.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private String message;
}
```

---

## 💻 PHẦN 3: FIX FRONTEND (login.js)

### ⚠️ Vấn đề Hiện Tại:
1. Function `checkLogin()` được khai báo nhưng không được gọi
2. Sử dụng mock data thay vì call API thực
3. Lỗi cú pháp: `})` không khớp với `function`
4. Biến `user` không được định nghĩa

### ✅ FIX login.js:

**File:** `src/main/resources/js/login.js`

```javascript
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;      // Thay 'username' thành 'email'
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        // Gọi API login
        const response = await fetch("/api/user/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Kiểm tra response
        if (response.ok) {
            const user = await response.json();
            
            // Lưu thông tin user vào localStorage
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userFullName', user.fullName);
            
            // Xóa thông báo lỗi
            errorMsg.classList.add('d-none');
            
            // Chuyển hướng tới home page
            window.location.href = '/home.html';
        } else {
            const error = await response.json();
            errorMsg.textContent = error.message || 'Đăng nhập thất bại';
            errorMsg.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        errorMsg.textContent = 'Lỗi kết nối đến server';
        errorMsg.classList.remove('d-none');
    }
});
```

---

## 🎨 PHẦN 4: CẬP NHẬT HTML FORM

### Thay đổi trong `login.html`:

**Thay:** `id="username"` → `id="email"`

```html
<!-- ❌ SAI -->
<input type="text" class="form-control" id="username" placeholder="Tên đăng nhập" required>
<label for="username">Tên đăng nhập</label>

<!-- ✅ ĐÚNG -->
<input type="email" class="form-control" id="email" placeholder="Email" required>
<label for="email">Email</label>
```

### Thêm div để hiển thị lỗi:

```html
<div id="errorMsg" class="alert alert-danger d-none" role="alert"></div>
```

---

## 📝 PHẦN 5: CẬP NHẬT USER REPOSITORY

**File:** `src/main/java/com/example/foodyrecommender/repository/UserRepository.java`

Thêm method nếu chưa có:
```java
User findUserByEmail(String email);
```

---

## 🗄️ PHẦN 6: KIỂM TRA DATABASE

### Tạo bảng users (nếu chưa có):

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tạo user test:

```sql
-- Password "123456" được hash bằng BCrypt
INSERT INTO users (email, full_name, password, phone, is_verified) 
VALUES ('test@example.com', 'Người Test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', '0123456789', TRUE);

INSERT INTO users (email, full_name, password, phone, is_verified) 
VALUES ('admin@example.com', 'Admin User', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', '0987654321', TRUE);
```

---

## 🧪 PHẦN 7: TEST HỆ THỐNG

### 1️⃣ Start Spring Boot Application:
```bash
./gradlew bootRun
```
Truy cập: `http://localhost:8085`

### 2️⃣ Test API với Postman/Curl:

```bash
# Test Login
curl -X POST http://localhost:8085/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### 3️⃣ Test giao diện:
- Truy cập `http://localhost:8085/login.html`
- Nhập email: `test@example.com`
- Nhập password: `123456`
- Nhấn đăng nhập

---

## 🔐 PHẦN 8: PASSWORD HASHING

### Cách Hash Password BCrypt:

**Online Tool:** https://www.bcryptcalculator.com/

Hoặc dùng Java để sinh:
```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hashedPassword = encoder.encode("123456");
System.out.println(hashedPassword);
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Cập nhật `UserController.java` (login method)
- [ ] Tạo `LoginRequest.java` DTO
- [ ] Tạo `ErrorResponse.java` DTO
- [ ] Cập nhật `login.js` (xóa mock data, gọi API thực)
- [ ] Cập nhật `login.html` (thay username → email)
- [ ] Kiểm tra `UserRepository.java` có method `findUserByEmail`
- [ ] Tạo bảng users trong database
- [ ] Thêm test data vào database
- [ ] Build project: `./gradlew clean build -x test`
- [ ] Run ứng dụng: `./gradlew bootRun`
- [ ] Test login qua giao diện
- [ ] Kiểm tra localStorage có lưu dữ liệu user

---

## 📚 TÀI LIỆU THAM KHẢO

- Spring Security: https://spring.io/projects/spring-security
- BCrypt: https://en.wikipedia.org/wiki/Bcrypt
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Bootstrap 5: https://getbootstrap.com/docs/5.0

---

## 💡 LỮU Ý QUAN TRỌNG

1. **Không bao giờ gửi mật khẩu plain text** - luôn hash bằng BCrypt
2. **Sử dụng HTTPS** khi deploy production
3. **Validate input** trên cả client và server
4. **Không log password** trong console
5. **Sử dụng email thay vì username** để unique và dễ verify

---

Hãy làm theo các bước này và báo cho tôi nếu gặp vấn đề!

