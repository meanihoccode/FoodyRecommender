package com.example.foodyrecommender.config;

import com.example.foodyrecommender.api.SystemController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class MaintenanceInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if (SystemController.isMaintenanceMode) {
            String uri = request.getRequestURI();

            // 1. Luôn mở cửa cho trang Đăng nhập và các file giao diện tĩnh (CSS, JS, Hình ảnh)
            if (uri.contains("/login") || uri.contains(".")) {
                return true;
            }

            // 2. KIỂM TRA "THẺ TÊN" (Xác định ai đang gọi API)

            /* --- NẾU DỰ ÁN DÙNG SESSION --- */
            // Lấy thông tin user đang đăng nhập từ Session (Bạn thay "loggedInUser" bằng key thực tế của bạn)
            // User currentUser = (User) request.getSession().getAttribute("loggedInUser");
            // if (currentUser != null && "ADMIN".equals(currentUser.getRole())) {
            //     return true; // Phán quyết: Là Admin -> Cho phép đi qua mọi ngóc ngách!
            // }

            /* --- NẾU DỰ ÁN DÙNG HEADER / JWT TOKEN --- */
            // Ví dụ frontend truyền lên một Header là "Role: ADMIN"
             String userRole = request.getHeader("Role");
             if ("ADMIN".equals(userRole)) {
                 return true; // Phán quyết: Là Admin -> Cho phép đi qua!
             }

            // 3. Nếu code chạy đến dòng này, nghĩa là KHÔNG PHẢI ADMIN -> Chặn đứng!
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE); // Lỗi 503
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Hệ thống đang bảo trì để nâng cấp. Vui lòng quay lại sau!\"}");
            return false;
        }

        // Nếu web không bật bảo trì -> Mọi người qua lại tự do
        return true;
    }
}