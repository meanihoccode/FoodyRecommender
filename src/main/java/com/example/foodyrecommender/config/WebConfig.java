package com.example.foodyrecommender.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private MaintenanceInterceptor maintenanceInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Đăng ký "người gác cổng" cho toàn bộ đường dẫn (/**)
        registry.addInterceptor(maintenanceInterceptor).addPathPatterns("/**");
    }
}