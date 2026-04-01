package com.example.foodyrecommender.service;

import com.example.foodyrecommender.dto.ChangePasswordRequest;
import com.example.foodyrecommender.entity.User;
import com.example.foodyrecommender.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.List;

@Service
@Transactional

public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User getUserById(long id) {
        return userRepository.findUserById(id);
    }

    public User getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public User saveUser(User user) {
        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userRepository.save(user);
    }

    public User updateUser(long id, User user) {
        User existingUser = this.getUserById(id);
        if (existingUser == null) {
            throw new RuntimeException("User not found with id: " + id);
        } else {
            existingUser.setFullName(user.getFullName());
            existingUser.setEmail(user.getEmail());
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
            existingUser.setPhone(user.getPhone());
            existingUser.setIsVerified(user.getIsVerified());
            return userRepository.save(existingUser);
        }
    }
    public User findByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    public User changePassword(long id, ChangePasswordRequest request) {
        User existUser = userRepository.findUserById(id);
        if (existUser == null) {
            throw new RuntimeException("User not found with id: " + id);
        } else {
            if (passwordEncoder.matches(request.getOldPassword(), existUser.getPassword())) {
                existUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(existUser);
                return existUser;
            } else  {
                throw new RuntimeException("Incorrect old password");
            }
        }
    }

    public User sendAgainEmail(String email) {
        // 1. Phải tìm User TRƯỚC TIÊN
        User user = userRepository.findByEmail(email); // (Hoặc findUserByEmail tùy tên hàm của bạn)

        if (user == null) {
            throw new RuntimeException("Không tìm thấy tài khoản với email này!");
        }
        if (user.getIsVerified()) {
            throw new RuntimeException("Tài khoản này đã được xác thực rồi!");
        }

        // 2. Tạo mã và Lưu xuống DB trước
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        // 3. DB lưu ok rồi thì mới sai Bưu tá đi gửi mail
        new Thread(() -> {
            emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        }).start();

        return savedUser;
    }

    public User registerUser(User user) {
        // Kiểm tra xem email đã bị ai dùng chưa
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email này đã được đăng ký!");
        }

        // Tạo ra 6 số ngẫu nhiên từ 000000 đến 999999
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Gắn thông tin OTP vào user
        user.setOtpCode(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        user.setIsVerified(false); // Chưa xác thực
        user.setIsActive(true);    // Vẫn cho phép hoạt động

        // (Tùy chọn: Ở đây bạn nên mã hóa password trước khi lưu nếu dùng Spring Security)
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Lưu xuống Database
        User savedUser = userRepository.save(user);

        // Gọi EmailService gửi mail đi (Có thể dùng luồng riêng để web không bị đơ chờ gửi mail)
        new Thread(() -> {
            emailService.sendOtpEmail(savedUser.getEmail(),savedUser.getFullName(), otp);
        }).start();

        return savedUser;
    }

    // 2. HÀM KIỂM TRA MÃ OTP
    public boolean verifyOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("Không tìm thấy người dùng!");
        }

        // Nếu mã khớp
        if (user.getOtpCode() != null && user.getOtpCode().equals(otpCode)) {
            // Kiểm tra thời gian (Không quá 90s)
            Duration duration = Duration.between(user.getOtpGeneratedTime(), LocalDateTime.now());
            if (duration.toSeconds() <= 90) {
                // Xác thực thành công!
                user.setIsVerified(true);
                user.setOtpCode(null); // Dọn dẹp mã cũ
                user.setOtpGeneratedTime(null);
                userRepository.save(user);
                return true;
            } else {
                throw new RuntimeException("Mã OTP đã hết hạn! Vui lòng yêu cầu mã mới.");
            }
        }

        return false; // Sai mã
    }

    public User lockAccount(int id) {
        User user = userRepository.findUserById(id);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + id);
        }
        if (user.getIsActive()) user.setIsActive(false);
        else  user.setIsActive(true);
        userRepository.save(user);
        return user;
    }
}
