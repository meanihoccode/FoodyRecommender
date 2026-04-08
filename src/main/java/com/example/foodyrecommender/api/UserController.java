package com.example.foodyrecommender.api;

import com.example.foodyrecommender.dto.ChangePasswordRequest;
import com.example.foodyrecommender.dto.ErrorResponse;
import com.example.foodyrecommender.dto.LoginRequest;
import com.example.foodyrecommender.entity.Reservation;
import com.example.foodyrecommender.entity.User;
import com.example.foodyrecommender.service.UserService;
import com.example.foodyrecommender.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<User>> getPagedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String isVerified,
            @RequestParam(required = false, defaultValue = "ALL") String isActive
            ) {
        Page<User> userPage = userService.getUsersWithPagination(page,size,keyword,isVerified,isActive);
        return ResponseEntity.ok(userPage);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.findByEmail(loginRequest.getEmail());
        String errorMessage = "Email hoặc mật khẩu không chính xác";

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(new ErrorResponse(errorMessage));
        }

        // Trạm 1: Xác thực OTP
        if (!user.getIsVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Tài khoản chưa được xác thực!",
                            "errorCode", "NOT_VERIFIED",
                            "email", user.getEmail()
                    ));
        }

        // Trạm 2: Kiểm tra trạng thái hoạt động
        if (!user.getIsActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Tài khoản đã bị khóa!"));
        }

        // ==========================================
        // CẤP "THẺ TÊN" JWT TẠI ĐÂY
        // ==========================================

        // 2. Tạo Token chứa Email và Quyền (Role)
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        // 3. Đóng gói phản hồi (Chứa Token và thông tin cơ bản)
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("role", user.getRole());
        response.put("fullName", user.getFullName());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Void> createUser(@RequestBody User user) {
        userService.saveUser(user);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/lockacc/{id}")
    public ResponseEntity<User> cancelReservation(@PathVariable int id) {
        // Gọi hàm hủy chuyên biệt từ Service
        User lockUser= userService.lockAccount(id);

        if (lockUser != null) {
            return ResponseEntity.ok(lockUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable int id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

// ... (Các API cũ giữ nguyên) ...

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable int id, @RequestBody ChangePasswordRequest request) {
        try {
            // Gọi hàm xử lý trong Service
            userService.changePassword(id, request.getOldPassword(), request.getNewPassword());

            // Trả về JSON thành công
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đổi mật khẩu thành công");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Trả về lỗi 400 (Bad Request) nếu sai mật khẩu cũ
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User newUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/send-again")
    public ResponseEntity<?> sendAgainEmail(@RequestBody Map<String, String> request) {
        try {
            // Hứng cục JSON { "email": "..." } từ Frontend
            String email = request.get("email");
            userService.sendAgainEmail(email);
            return ResponseEntity.ok(Map.of("message", "Đã gửi lại mã OTP thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }


    // API 2: Xác thực OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        try {
            boolean isVerified = userService.verifyOtp(email, otp);
            if (isVerified) {
                return ResponseEntity.ok(Map.of("message", "Xác thực tài khoản thành công!"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Mã OTP không chính xác!"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
    // API 3: Cập nhật thông tin cá nhân (Tên, SĐT)
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable int id, @RequestBody Map<String, String> request) {
        try {
            // Lấy user hiện tại từ Database
            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy người dùng"));
            }

            // Chỉ cập nhật những trường được phép
            existingUser.setFullName(request.get("fullName"));
            existingUser.setPhone(request.get("phone"));

            // Lưu lại vào DB
            userService.updateUser(id, existingUser);

            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật thông tin thành công!",
                    "fullName", existingUser.getFullName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Lỗi khi cập nhật thông tin"));
        }
    }


}

