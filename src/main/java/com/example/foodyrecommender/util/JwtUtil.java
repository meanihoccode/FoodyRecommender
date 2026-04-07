package com.example.foodyrecommender.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    // Chìa khóa bí mật để ký Token (Phải dài ít nhất 256-bit)
    private final String SECRET_KEY = "DayLaMotChiaKhoaBiMatCucKyDaiCuaFoodyRecommenderDuAn";
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Thời gian sống của Token (Ví dụ: 24 giờ = 86400000 ms)
    private final long EXPIRATION_TIME = 86400000;

    // 1. Máy tạo Token (Cấp thẻ)
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // Nhét chức vụ vào trong Token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Máy kiểm tra và đọc Token (Kiểm tra thẻ)
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null; // Token sai, giả mạo hoặc hết hạn
        }
    }
}