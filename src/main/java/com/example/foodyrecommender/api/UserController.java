package com.example.foodyrecommender.api;

import com.example.foodyrecommender.dto.ChangePasswordRequest;
import com.example.foodyrecommender.dto.ErrorResponse;
import com.example.foodyrecommender.dto.LoginRequest;
import com.example.foodyrecommender.entity.Reservation;
import com.example.foodyrecommender.entity.User;
import com.example.foodyrecommender.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
        // Tìm user theo email
        User user = userService.findByEmail(loginRequest.getEmail());

        // Thông báo lỗi chung để bảo mật
        String errorMessage = "Email hoặc mật khẩu không chính xác";

        // Kiểm tra user có tồn tại không và password có khớp không
        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(new ErrorResponse(errorMessage));
        }

        // ==========================================
        // LẮP 2 TRẠM KIỂM SOÁT BẢO MẬT TẠI ĐÂY
        // ==========================================

        // Trạm 1: Bắt buộc phải xác thực OTP
        if (!user.getIsVerified()) {
            // Ném về mã 403 (Forbidden) và gắn cờ "NOT_VERIFIED" cho Frontend dễ nhận biết
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Tài khoản chưa được xác thực! Vui lòng kiểm tra email để lấy mã OTP.",
                            "errorCode", "NOT_VERIFIED",
                            "email", user.getEmail()
                    ));
        }

        // Trạm 2: Quyền lực của Admin (Chặn tài khoản bị khóa)
        if (!user.getIsActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!"));
        }

        // Vượt qua hết thì cho phép Login thành công
        return ResponseEntity.ok(user);
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

    @PutMapping("change-password/{id}")
    public ResponseEntity<User> changePassword(@PathVariable int id, @RequestBody ChangePasswordRequest changePasswordRequest) {
        User existUser = userService.changePassword(id,changePasswordRequest);
        if (existUser == null) {
            return ResponseEntity.notFound().build();
        } else  {
            return ResponseEntity.ok(existUser);
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


}

