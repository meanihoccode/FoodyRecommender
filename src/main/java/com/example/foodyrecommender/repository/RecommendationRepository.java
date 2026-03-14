package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

public interface RecommendationRepository  extends JpaRepository<Recommendation, Integer>
{
    Recommendation findRecommendationById(long id);
}