package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.entity.User_Saved;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface User_SavedRepository extends JpaRepository<User_Saved, Long> {
    @Query("SELECT us.restaurantId FROM User_Saved us WHERE us.userId = :userId")
    List<Restaurant> findSavedRestaurantsByUserId(long userId);

    void deleteByUserIdAndRestaurantId(long userId, long restaurantId);
}