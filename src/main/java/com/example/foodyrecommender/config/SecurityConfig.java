package com.example.foodyrecommender.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tạm thời tắt CSRF để Javascript (Fetch API) có thể gửi POST request được
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(authorize -> authorize
                        // 2. CHO PHÉP TRUY CẬP GIAO DIỆN (HTML/CSS/JS)
                        .requestMatchers(
                                "/", "/index", "/*.html",
                                "/login", "/signup", "/register",
                                "/home",
                                "/admin-dashboard", // 👈 Mở cổng cho trang Admin chuẩn bị làm
                                "/restaurants", "/restaurant-detail/**",
                                "/reservations", "/reservations/**",
                                "/favourites", "/favourites/**", "/favourite/**",
                                "/css/**", "/js/**", "/img/**"
                                , "/manage-reservations", "/manage-reservations/**"
                                , "/manage-users", "/manage-users/**","/manage-restaurants"
                                ,"/manage-restaurants/**"
                        ).permitAll()

                        // 3. CHO PHÉP TRUY CẬP API LIÊN QUAN ĐẾN TÀI KHOẢN & OTP
                        .requestMatchers(
                                "/api/user/login",
                                "/api/user/register",
                                "/api/user/verify-otp",
                                "/api/user/send-again"
                        ).permitAll()

                        // 4. CHO PHÉP CÁC API PUBLIC KHÁC (Tạm thời mở để làm FrontEnd cho dễ)
                        .requestMatchers("/api/restaurants/**", "/api/recommendations/**", "/api/reservations", "/api/reservations/**").permitAll()
                        .requestMatchers("/api/user/**", "/api/reservations/users/**", "/api/user-saved/**","/api/ratings","/api/ratings").permitAll()

                        // 5. CÁC ENDPOINT KHÁC ĐỀU BỊ CHẶN
                        .anyRequest().authenticated()
                )
                // 6. TẮT TÍNH NĂNG FORM LOGIN MẶC ĐỊNH CỦA SPRING
                // Vì chúng ta đã tự viết màn hình đăng nhập và xử lý bằng JS/API rồi
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}