package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Recommendation;
import com.example.foodyrecommender.repository.RecommendationRepository;
import com.example.foodyrecommender.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class RecommendationService {
    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    public Recommendation getRecommendationByRestaurantId(long restaurantId) {
        return recommendationRepository.findRecommendationByRestaurantId(restaurantId);
    }
}