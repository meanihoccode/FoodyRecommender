package com.example.foodyrecommender.api;

import com.example.foodyrecommender.entity.Recommendation;
import com.example.foodyrecommender.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {
    @Autowired
    private RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<Recommendation>> getAllRecommendations() {
        List<Recommendation> recommendations = recommendationService.getAllRecommendations();
        return ResponseEntity.ok(recommendations);
    }
    // Thêm API này để lấy danh sách gợi ý cho TỪNG NGƯỜI DÙNG (Dùng cho Trang chủ)
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getRecommendationsByUserId(@PathVariable int userId) {
        // LƯU Ý: Hàm này trong Service của bạn nên trả về List<Restaurant> (Danh sách nhà hàng)
        // dựa trên kết quả AI đã tính toán và lưu trong bảng Recommendation.
        List<?> recommendedRestaurants = recommendationService.getRecommendationByUserId(userId);

        if (recommendedRestaurants == null || recommendedRestaurants.isEmpty()) {
            return ResponseEntity.noContent().build(); // Trả về 204 nếu chưa có gợi ý (Cold start)
        }
        return ResponseEntity.ok(recommendedRestaurants);
    }

    @GetMapping("/{RestaurantId}")
    public ResponseEntity<List<Recommendation>> getRecommendationByRestaurantId(@PathVariable int RestaurantId) {
        List<Recommendation> recommendations = recommendationService.getRecommendationByRestaurantId(RestaurantId);
        if (recommendations.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recommendations);
    }
}
