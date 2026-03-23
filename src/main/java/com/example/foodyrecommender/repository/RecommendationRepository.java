package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    Recommendation findRecommendationByRestaurantId(long restaurantId);

    @Query("SELECT r FROM Recommendation r WHERE r.restaurantId = :restaurantId")
    List<Recommendation> findRecommendationByRestaurantId(int restaurantId);
}