package com.example.foodyrecommender.config;

import com.example.foodyrecommender.api.SystemController;
import com.example.foodyrecommender.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class MaintenanceInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // 1. CHỈ KÍCH HOẠT KHI ADMIN BẬT CÔNG TẮC BẢO TRÌ
        if (SystemController.isMaintenanceMode) {
            if (request.getMethod().equals("OPTIONS")) {
                return true;
            }

            String uri = request.getRequestURI();

            // Luôn mở cửa cho trang Đăng nhập, API login và các file tĩnh (CSS/JS/Ảnh)
            if (uri.contains("/login") || uri.contains("/api/user/login") || uri.contains(".")) {
                return true;
            }

            // 2. KIỂM TRA THẺ TÊN (TOKEN)
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                try {
                    Claims claims = jwtUtil.parseToken(token);
                    if (claims != null) {
                        String role = claims.get("role", String.class);
                        // NẾU LÀ ADMIN -> Trải thảm đỏ cho đi qua thoải mái!
                        if ("ADMIN".equals(role)) {
                            return true;
                        }
                    }
                } catch (Exception e) {
                    // Token lỗi hoặc hết hạn thì kệ nó, rớt xuống dòng dưới để chặn
                }
            }

            // 3. NẾU KHÔNG PHẢI ADMIN HOẶC KHÔNG CÓ THẺ -> Đuổi ra ngoài!
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE); // Bắn lỗi 503
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Hệ thống đang bảo trì để nâng cấp. Vui lòng quay lại sau!\"}");
            return false;
        }

        // NẾU CÔNG TẮC BẢO TRÌ ĐANG TẮT -> Ai cũng được qua (Hoạt động bình thường)
        return true;
    }
}