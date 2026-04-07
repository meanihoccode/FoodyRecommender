package com.example.foodyrecommender.config;

import com.example.foodyrecommender.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 1. LUÔN CHO QUA CÁC REQUEST DÒ ĐƯỜNG (Để không bị chặn lỗi CORS)
        if (method.equals("OPTIONS")) {
            return true;
        }

        // 2. CHO QUA CÁC API KHÔNG CẦN ĐĂNG NHẬP (Public APIs)
        // Lưu ý: Bạn có thể thêm các API liên quan đến quên mật khẩu vào đây nếu có
        if (uri.contains("/login") || uri.contains("/register") || uri.contains("/verify-otp") || uri.contains("/send-again")) {
            return true;
        }

        // ========================================================
        // TỪ ĐÂY TRỞ XUỐNG: BẮT BUỘC PHẢI ĐĂNG NHẬP MỚI ĐƯỢC ĐI TIẾP
        // ========================================================

        // 3. KIỂM TRA THẺ TÊN (TOKEN)
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Vui lòng đăng nhập để sử dụng tính năng này!\"}");
            return false;
        }

        String token = header.substring(7);
        Claims claims = jwtUtil.parseToken(token);

        if (claims == null) {
            // Token sai, bị giả mạo hoặc đã hết hạn
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Phiên đăng nhập không hợp lệ hoặc đã hết hạn!\"}");
            return false;
        }

        // 4. PHÂN QUYỀN (AUTHORIZATION) SAU KHI ĐÃ ĐĂNG NHẬP
        String role = claims.get("role", String.class);

        // Các hành động chỉ Admin mới được làm:
        // - Đụng vào /api/system
        // - Gửi lệnh POST, PUT, DELETE vào /api/restaurants
        boolean isSystemApi = uri.startsWith("/api/system");
        boolean isModifyingRestaurant = uri.startsWith("/api/restaurants") && !method.equals("GET");

        if (isSystemApi || isModifyingRestaurant) {
            if (!"ADMIN".equals(role)) {
                // Đã login nhưng chỉ là tài khoản USER thường
                response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\": \"Bạn không có quyền thực hiện hành động này!\"}");
                return false;
            }
        }

        // Nếu qua được mọi cửa ải (Đã login và không làm hành động vượt quyền) -> Cho phép đi vào Controller
        return true;
    }
}