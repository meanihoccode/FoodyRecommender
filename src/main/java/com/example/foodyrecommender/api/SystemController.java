package com.example.foodyrecommender.api; // Hoặc .controller tùy cấu trúc của bạn

import com.example.foodyrecommender.service.RecommendationTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*")
public class SystemController {

    // Tiêm (Inject) cái Task chạy Python của bạn vào đây
    @Autowired
    private RecommendationTask recommendationTask;

    @PostMapping("/trigger-ai")
    public ResponseEntity<Map<String, String>> triggerAiManually() {
        Map<String, String> response = new HashMap<>();
        try {
            // Ra lệnh cho Java chạy cái hàm Python ngay lập tức!
            recommendationTask.runPythonRecommendation();

            response.put("message", "Chạy AI Recommender thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Lỗi hệ thống khi chạy AI: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}