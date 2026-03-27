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

    @GetMapping("/{RestaurantId}")
    public ResponseEntity<List<Recommendation>> getRecommendationByRestaurantId(@PathVariable int RestaurantId) {
        List<Recommendation> recommendations = recommendationService.getRecommendationByRestaurantId(RestaurantId);
        if (recommendations.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recommendations);
    }
}
