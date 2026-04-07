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

    // Biến lưu trạng thái bảo trì (Mặc định là false - Hoạt động bình thường)
    // Dùng static để biến này tồn tại duy nhất trên toàn Server
    public static boolean isMaintenanceMode = false;

    // API 1: Lấy trạng thái hiện tại (để Frontend hiển thị nút gạt đúng vị trí)
    @GetMapping("/maintenance")
    public ResponseEntity<Boolean> getMaintenanceStatus() {
        return ResponseEntity.ok(isMaintenanceMode);
    }

    // API 2: Bật/Tắt chế độ bảo trì
    @PostMapping("/maintenance")
    public ResponseEntity<Map<String, String>> toggleMaintenance(@RequestParam boolean status) {
        isMaintenanceMode = status;

        Map<String, String> response = new HashMap<>();
        response.put("message", status ? "Đã BẬT chế độ bảo trì!" : "Đã TẮT chế độ bảo trì!");
        return ResponseEntity.ok(response);
    }
}