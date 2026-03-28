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
            .csrf(csrf -> csrf.disable())  // Tạm thời disable CSRF (cần enable lại khi production)
            .authorizeHttpRequests(authorize -> authorize
                // Cho phép truy cập các trang công khai
                    .requestMatchers(
                            "/",
                            "/index",
                            "/*.html", // hỗ trợ các link cũ dạng /login.html, /restaurant-detail.html...
                            "/login",
                            "/signup",
                            "/home",
                            "/restaurants",
                            "/css/**",
                            "/js/**",
                            "/img/**",
                            "/restaurant-detail",
                            "/restaurant-detail/**",
                            "/reservations",
                            "/reservations/**" // allow /reservations/1, /reservations/anything
                    ).permitAll()
                // Cho phép truy cập API public
                .requestMatchers("/api/user/**").permitAll()
                .requestMatchers("/api/restaurants/**").permitAll()
                .requestMatchers("/api/reservations/**").permitAll()
                .requestMatchers("/api/user-saved/**").permitAll()
                .requestMatchers("/api/recommendations/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/reservations/users/**").permitAll()
                // Các endpoint khác cần xác thực
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )
            .logout(logout -> logout
                .permitAll()
            );

        return http.build();
    }
}
