package com.example.foodyrecommender.api;

import com.example.foodyrecommender.dto.ChangePasswordRequest;
import com.example.foodyrecommender.dto.ErrorResponse;
import com.example.foodyrecommender.dto.LoginRequest;
import com.example.foodyrecommender.entity.User;
import com.example.foodyrecommender.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Tìm user theo email
        User user = userService.findByEmail(loginRequest.getEmail());

        // Thông báo lỗi chung để bảo mật
        String errorMessage = "Email hoặc mật khẩu không chính xác";

        // Kiểm tra user có tồn tại không
        if (user == null) {
            return ResponseEntity.status(401).body(new ErrorResponse(errorMessage));
        }

        // Kiểm tra password có khớp không
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(new ErrorResponse(errorMessage));
        }

        // Login thành công
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<Void> createUser(@RequestBody User user) {
        userService.saveUser(user);
        return ResponseEntity.status(201).build();
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

