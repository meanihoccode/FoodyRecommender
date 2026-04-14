package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Recommendation;
import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.repository.RecommendationRepository;
import com.example.foodyrecommender.repository.RestaurantRepository;
import com.example.foodyrecommender.repository.User_SavedRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
@Service
@Transactional
public class RecommendationService {
    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private User_SavedRepository userSavedRepository;

    public List<Recommendation> getRecommendationByRestaurantId(int restaurantId) {
        return recommendationRepository.findRecommendationByRestaurantId(restaurantId);
    }

    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }
    public List<Restaurant> getRecommendationByUserId(int userId) {

        // BƯỚC 1: Lấy danh sách ID nhà hàng mà User đã BẤM YÊU THÍCH
        List<Integer> historyIds = userSavedRepository.findRestaurantIdsByUserId(userId);

        // NẾU COLD-START: Người dùng chưa yêu thích quán nào cả
        if (historyIds == null || historyIds.isEmpty()) {
            return getColdStartRecommendations();
        }

        // BƯỚC 2: Thuật toán AI "Bắc Cầu" (Tính điểm)
        Map<Integer, Integer> recommendedScoreMap = new HashMap<>();

        for (Integer histId : historyIds) {
            // Lấy danh sách các nhà hàng giống với quán (histId) mà user đã thích
            Optional<Recommendation> recOpt = recommendationRepository.findById((long)histId);

            if (recOpt.isPresent()) {
                List<Integer> similarIds = recOpt.get().getSimilarRestaurantIds();

                for (Integer simId : similarIds) {
                    // Cực kỳ quan trọng: CHỈ gợi ý những quán mà User CHƯA lưu vào Yêu thích
                    if (!historyIds.contains(simId)) {
                        recommendedScoreMap.put(simId, recommendedScoreMap.getOrDefault(simId, 0) + 1);
                    }
                }
            }
        }

        // BƯỚC 3: Xếp hạng và lấy ra 4 quán có điểm cao nhất
        List<Integer> topRecommendedIds = recommendedScoreMap.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .limit(4)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // BƯỚC 4: Lấy thông tin chi tiết của 4 quán đó để gửi về Frontend
        if (topRecommendedIds.isEmpty()) {
            return getColdStartRecommendations();
        }

        return restaurantRepository.findAllById(topRecommendedIds);
    }

    // ===============================================
    // HÀM CHỮA CHÁY (COLD-START) DÀNH CHO USER MỚI
    // ===============================================
    private List<Restaurant> getColdStartRecommendations() {
        // Trả về Top 4 quán có điểm Rating cao nhất toàn hệ thống để "chào hàng"
        return restaurantRepository.findTop4ByOrderByRatingDesc();
    }
}