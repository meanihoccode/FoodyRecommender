package com.example.foodyrecommender;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // BẬT TÍNH NĂNG CHẠY ĐỊNH KỲ
public class FoodyRecommenderApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodyRecommenderApplication.class, args);
    }
}
