package com.example.foodyrecommender.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã xác thực Đăng ký tài khoản Foody");
        message.setText("Chào bạn,\n\n" +
                "Mã OTP để kích hoạt tài khoản của bạn là: " + otp + "\n" +
                "Mã này có hiệu lực trong vòng 5 phút.\n\n" +
                "Trân trọng,\nĐội ngũ Foody.");

        mailSender.send(message);
    }
}