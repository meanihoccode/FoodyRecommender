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

    // 1. GIỮ LẠI: Công cụ mã hóa mật khẩu cực kỳ quan trọng
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. TỐI ƯU LẠI: Bộ lọc bảo mật
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF để JWT và React/Fetch API có thể hoạt động
                .csrf(csrf -> csrf.disable())

                // MỞ TOANG HÀNG RÀO NGOÀI CÙNG
                // Việc kiểm tra ai được vào API nào sẽ do AuthInterceptor và MaintenanceInterceptor lo!
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().permitAll()
                )

                // Tắt form login mặc định của Spring
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}