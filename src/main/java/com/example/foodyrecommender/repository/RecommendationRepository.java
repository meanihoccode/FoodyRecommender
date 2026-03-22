package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    Recommendation findRecommendationByRestaurantId(long restaurantId);
}