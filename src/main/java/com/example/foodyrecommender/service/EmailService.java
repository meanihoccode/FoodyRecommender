package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Truyền thêm fullName vào tham số hàm
    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("🔥 KÍCH HOẠT TÀI KHOẢN FOODY - TRẢI NGHIỆM NGAY!");

        // Dùng String.format để nội dung nhìn sạch sẽ hơn
        String content = String.format(
                "Thân chào %s,\n\n" +
                        "Cảm ơn bạn đã gia nhập cộng đồng Foody Recommender! 🍽️\n\n" +
                        "Để hoàn tất đăng ký, vui lòng nhập mã xác thực dưới đây:\n" +
                        "------------------------------------------\n" +
                        "Mã OTP của bạn là: %s\n" +
                        "------------------------------------------\n" +
                        "Lưu ý: Mã này có hiệu lực trong vòng 90 giây.\n\n" +
                        "Nếu không phải bạn thực hiện đăng ký, hãy bỏ qua email này.\n\n" +
                        "Trân trọng,\n" +
                        "Đội ngũ hỗ trợ Foody.",
                fullName, otp
        );

        message.setText(content);
        mailSender.send(message);
    }
}