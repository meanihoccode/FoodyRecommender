package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.entity.User_Saved;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface User_SavedRepository extends JpaRepository<User_Saved,Integer> {
    @Query("SELECT us.restaurantId FROM User_Saved us WHERE us.userId = :userId")
    List<Restaurant> findSavedRestaurantsByUserId(long userId);

    User_Saved findByUserId(long id);
}