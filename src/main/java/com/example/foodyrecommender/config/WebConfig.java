package com.example.foodyrecommender.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private MaintenanceInterceptor maintenanceInterceptor;

    @Autowired
    private AuthInterceptor authInterceptor; // 1. Gọi anh bảo vệ mới đến

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Rút 2 anh bảo vệ về chỉ canh gác khu vực Dữ liệu (/api/**)
        registry.addInterceptor(maintenanceInterceptor).addPathPatterns("/api/**");
        registry.addInterceptor(authInterceptor).addPathPatterns("/api/**");
    }

}