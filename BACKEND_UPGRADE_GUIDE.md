# 📚 Hướng Dẫn Nâng Cấp Backend - FoodyRecommender

## 📋 Mục Lục
1. [Nhận xét về Backend Hiện Tại](#nhận-xét-về-backend-hiện-tại)
2. [Hướng Dẫn Test API Với Postman](#hướng-dẫn-test-api-với-postman)
3. [Kế Hoạch Nâng Cấp](#kế-hoạch-nâng-cấp)
4. [Chi Tiết Các Cải Tiến](#chi-tiết-các-cải-tiến)

---

## 🔍 Nhận Xét Về Backend Hiện Tại

### ✅ Điểm Mạnh
1. **Cấu Trúc Rõ Ràng**
   - Sử dụng pattern MVC (Model-View-Controller)
   - Tách biệt Entity, Repository, Service, Controller một cách logic

2. **Security Config Cơ Bản**
   - Cấu hình Spring Security để disable CSRF tạm thời
   - Sử dụng BCrypt để hash password

3. **Database Connection**
   - Kết nối MySQL đúng cách
   - Hibernate DDL-auto set to "update"

4. **API RESTful**
   - Các endpoint CRUD cơ bản được xây dựng
   - CORS được cấu hình cho phép cross-origin

### ⚠️ Điểm Yếu Cần Cải Thiện

1. **Error Handling**
   - ❌ Thiếu custom exception handling
   - ❌ Không có @ExceptionHandler toàn cục
   - ❌ Thông báo lỗi không nhất quán

2. **Validation**
   - ❌ Thiếu validation trên input (@Valid, @NotNull, @Email, v.v)
   - ❌ Không có DTO validation

3. **Response Format**
   - ❌ Response không có structure nhất quán
   - ❌ Thiếu HTTP status codes thích hợp

4. **Logging**
   - ❌ Không có logging system
   - ❌ Khó debug khi có lỗi

5. **Authentication & Authorization**
   - ❌ Chưa có JWT token implementation
   - ❌ Session management chưa rõ ràng

6. **DTO (Data Transfer Object)**
   - ❌ Ít DTO được sử dụng
   - ❌ Dữ liệu entity được trả trực tiếp

7. **Pagination & Filtering**
   - ❌ Không có pagination cho danh sách dài
   - ❌ Không có filtering/sorting

8. **Documentation**
   - ❌ Thiếu API documentation (Swagger/Springdoc-openapi)

9. **Testing**
   - ❌ Chưa có unit tests
   - ❌ Chưa có integration tests

10. **Performance**
    - ❌ Thiếu caching strategy
    - ❌ Không có query optimization

---

## 🚀 Hướng Dẫn Test API Với Postman

### 1️⃣ Cài Đặt Postman
- Download từ: https://www.postman.com/downloads/
- Hoặc sử dụng Postman Web: https://web.postman.co/

### 2️⃣ Import Collection

**Tạo Collection Mới:**
1. Click "+" để tạo tab mới
2. Đặt tên: "FoodyRecommender API"

### 3️⃣ Test Các Endpoint

#### **A. USER ENDPOINTS**

**1. Đăng Ký (Sign Up)**
```
POST http://localhost:8085/api/user
Content-Type: application/json

{
  "email": "user1@example.com",
  "fullName": "Nguyễn Văn A",
  "password": "password123",
  "phone": "0912345678",
  "isVerified": true
}
```

**Expected Response (201 Created):**
```json
{}
```

---

**2. Đăng Nhập (Login)**
```
POST http://localhost:8085/api/user/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "email": "test@example.com",
  "fullName": "Người Test",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm",
  "phone": "0123456789",
  "isVerified": true
}
```

**Response khi sai (401 Unauthorized):**
```json
{
  "message": "Email hoặc mật khẩu không chính xác"
}
```

---

**3. Lấy Tất Cả Người Dùng**
```
GET http://localhost:8085/api/user
```

---

**4. Lấy Người Dùng Theo ID**
```
GET http://localhost:8085/api/user/1
```

---

**5. Cập Nhật Người Dùng**
```
PUT http://localhost:8085/api/user/1
Content-Type: application/json

{
  "email": "newemail@example.com",
  "fullName": "Tên Mới",
  "password": "newpassword123",
  "phone": "0987654321",
  "isVerified": true
}
```

---

**6. Thay Đổi Mật Khẩu**
```
PUT http://localhost:8085/api/user/change-password/1
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

**7. Xóa Người Dùng**
```
DELETE http://localhost:8085/api/user/1
```

---

#### **B. RESTAURANT ENDPOINTS**

**1. Tạo Nhà Hàng**
```
POST http://localhost:8085/api/restaurants
Content-Type: application/json

{
  "name": "Cơm Tấm Sài Gòn",
  "description": "Cơm tấm ngon, giá rẻ",
  "category": "Vietnamese",
  "priceAverage": "50000-100000",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "name": "Cơm Tấm Sài Gòn",
  "description": "Cơm tấm ngon, giá rẻ",
  "category": "Vietnamese",
  "priceAverage": "50000-100000",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "imageUrl": "https://example.com/image.jpg"
}
```

---

**2. Lấy Tất Cả Nhà Hàng**
```
GET http://localhost:8085/api/restaurants
```

---

**3. Lấy Nhà Hàng Theo ID**
```
GET http://localhost:8085/api/restaurants/1
```

---

**4. Cập Nhật Nhà Hàng**
```
PUT http://localhost:8085/api/restaurants/1
Content-Type: application/json

{
  "name": "Cơm Tấm Sài Gòn - Nhánh 2",
  "description": "Cơm tấm ngon, giá rẻ, phục vụ nhanh",
  "category": "Vietnamese",
  "priceAverage": "50000-150000",
  "address": "456 Đường XYZ, Quận 2, TP.HCM",
  "imageUrl": "https://example.com/image2.jpg"
}
```

---

**5. Xóa Nhà Hàng**
```
DELETE http://localhost:8085/api/restaurants/1
```

---

#### **C. RESERVATION ENDPOINTS**

**1. Tạo Đặt Bàn**
```
POST http://localhost:8085/api/reservations
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "bookingDate": "2026-04-15",
  "bookingTime": "19:00:00",
  "partySize": 4,
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0912345678",
  "status": "PENDING",
  "createdAt": "2026-03-25T10:30:00"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "restaurantId": 1,
  "bookingDate": "2026-04-15",
  "bookingTime": "19:00:00",
  "partySize": 4,
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0912345678",
  "status": "PENDING",
  "createdAt": "2026-03-25T10:30:00"
}
```

---

**2. Lấy Tất Cả Đặt Bàn**
```
GET http://localhost:8085/api/reservations
```

---

**3. Lấy Đặt Bàn Theo ID**
```
GET http://localhost:8085/api/reservations/1
```

---

**4. Cập Nhật Đặt Bàn**
```
PUT http://localhost:8085/api/reservations/1
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

---

**5. Xóa Đặt Bàn**
```
DELETE http://localhost:8085/api/reservations/1
```

---

#### **D. USER_SAVED ENDPOINTS**

**1. Lưu Nhà Hàng Yêu Thích**
```
POST http://localhost:8085/api/user-saved
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "createdAt": "2026-03-25T10:30:00"
}
```

---

**2. Lấy Danh Sách Yêu Thích**
```
GET http://localhost:8085/api/user-saved/user/1
```

---

**3. Xóa Khỏi Danh Sách Yêu Thích**
```
DELETE http://localhost:8085/api/user-saved/1
```

---

#### **E. RECOMMENDATION ENDPOINTS**

**1. Lấy Tất Cả Gợi Ý**
```
GET http://localhost:8085/api/recommendations
```

---

**2. Lấy Gợi Ý Cho Nhà Hàng**
```
GET http://localhost:8085/api/recommendations/1
```

---

### 4️⃣ Các Lỗi Phổ Biến và Cách Khắc Phục

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| 404 Not Found | Endpoint sai | Kiểm tra URL và HTTP method |
| 400 Bad Request | JSON format sai | Kiểm tra JSON syntax |
| 401 Unauthorized | Sai email/password | Kiểm tra thông tin đăng nhập |
| 500 Internal Server Error | Lỗi server | Kiểm tra console logs |
| Connection refused | Server không chạy | Chạy `.\gradlew.bat bootRun` |

---

## 🔧 Kế Hoạch Nâng Cấp

### **Phase 1: Foundation (Tuần 1-2)**
- [ ] Thêm validation layer
- [ ] Tạo Global Exception Handler
- [ ] Implement DTO pattern
- [ ] Thêm Logging

### **Phase 2: Security (Tuần 3-4)**
- [ ] Implement JWT Token
- [ ] Refactor authentication
- [ ] Thêm Role-based access control

### **Phase 3: Features (Tuần 5-6)**
- [ ] Pagination & Filtering
- [ ] Caching strategy
- [ ] Search functionality

### **Phase 4: Quality (Tuần 7-8)**
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] API Documentation (Swagger)

---

## 📝 Chi Tiết Các Cải Tiến

### 1. Global Exception Handler

**Tạo file:** `src/main/java/com/example/foodyrecommender/exception/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(404)
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(404).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(500)
            .message("Internal Server Error")
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(500).body(error);
    }
}
```

---

### 2. Input Validation

**Cập nhật User Entity:**

```java
@Entity
@Table(name = "users")
public class User {
    // ...existing fields...
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Column(name = "email", unique = true)
    private String email;
    
    @NotBlank(message = "Tên không được để trống")
    @Column(name = "full_name")
    private String fullName;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    @Column(name = "password")
    private String password;
}
```

---

### 3. DTO Pattern

**Tạo CreateUserDTO:**

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserDTO {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String fullName;
    
    @NotBlank
    @Size(min = 6)
    private String password;
    
    @NotBlank
    @Pattern(regexp = "^\\d{10,11}$")
    private String phone;
}
```

---

### 4. Logging Implementation

**Cập nhật UserService:**

```java
@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    public User saveUser(User user) {
        logger.info("Creating new user with email: {}", user.getEmail());
        try {
            String hashedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(hashedPassword);
            User savedUser = userRepository.save(user);
            logger.info("User created successfully with id: {}", savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            logger.error("Error creating user with email: {}", user.getEmail(), e);
            throw new RuntimeException("Error creating user", e);
        }
    }
}
```

---

### 5. Pagination Implementation

**Cập nhật RestaurantController:**

```java
@GetMapping
public ResponseEntity<Page<Restaurant>> getAllRestaurants(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "id") String sortBy,
    @RequestParam(defaultValue = "ASC") String direction
) {
    Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
    Page<Restaurant> restaurants = restaurantService.getAllRestaurants(pageable);
    return ResponseEntity.ok(restaurants);
}
```

---

### 6. JWT Token Implementation

**Thêm dependency:**

```gradle
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
```

**Tạo JwtTokenProvider:**

```java
@Component
public class JwtTokenProvider {
    @Value("${app.jwtSecret}")
    private String jwtSecret;
    
    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;
    
    public String generateToken(String email) {
        return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getEmailFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
```

---

### 7. API Documentation (Swagger)

**Thêm dependency:**

```gradle
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.0.0'
```

**Cấu hình Swagger:**

```java
@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("FoodyRecommender API")
                .version("1.0.0")
                .description("API Documentation for FoodyRecommender System"));
    }
}
```

**Truy cập:** `http://localhost:8085/swagger-ui.html`

---

### 8. Unit Testing

**Ví dụ UserService Test:**

```java
@SpringBootTest
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    public void testSaveUser() {
        User user = User.builder()
            .email("test@example.com")
            .fullName("Test User")
            .password("password123")
            .phone("0912345678")
            .build();
        
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");
        when(userRepository.save(any())).thenReturn(user);
        
        User savedUser = userService.saveUser(user);
        
        assertNotNull(savedUser);
        assertEquals("test@example.com", savedUser.getEmail());
    }
}
```

---

### 9. Caching Strategy

**Thêm caching cho RestaurantService:**

```java
@Service
public class RestaurantService {
    
    @Cacheable("restaurants")
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
    
    @CacheEvict(value = "restaurants", allEntries = true)
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
}
```

---

### 10. Search & Filter

**Thêm Search functionality:**

```java
@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
    
    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> search(
        @RequestParam String keyword,
        @RequestParam String category
    ) {
        List<Restaurant> results = restaurantService.search(keyword, category);
        return ResponseEntity.ok(results);
    }
}
```

---

## 📊 Checklist Nâng Cấp

- [ ] Global Exception Handler
- [ ] Input Validation (JSR 380)
- [ ] DTO Pattern
- [ ] Logging System
- [ ] Pagination
- [ ] JWT Authentication
- [ ] API Documentation (Swagger)
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Caching
- [ ] Search/Filter Features
- [ ] Rate Limiting
- [ ] API Versioning

---

## 🎯 Ưu Tiên Hàng Đầu

**Tuần Đầu (Ngay Lập Tức):**
1. ✅ Global Exception Handler
2. ✅ Input Validation
3. ✅ Logging

**Tuần Thứ 2:**
1. ✅ DTO Pattern
2. ✅ JWT Token
3. ✅ Pagination

**Tuần Thứ 3:**
1. ✅ Swagger Documentation
2. ✅ Unit Tests
3. ✅ Search Functionality

---

## 📞 Liên Hệ & Support

Khi gặp vấn đề:
1. Kiểm tra **logs** trong console
2. Sử dụng **Postman** để test API
3. Kiểm tra **database** để xác nhận dữ liệu
4. Tham khảo **Spring Boot Documentation**

---

## 📚 Tài Liệu Tham Khảo

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [JWT Token](https://jwt.io)
- [Postman Learning Center](https://learning.postman.com/)


