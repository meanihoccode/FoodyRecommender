package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.entity.User_Saved;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import jakarta.transaction.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface User_SavedRepository extends JpaRepository<User_Saved, Long> {
    @Query("SELECT us.restaurant FROM User_Saved us WHERE us.user.id = :userId")
    List<Restaurant> findSavedRestaurantsByUserId(long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM User_Saved us WHERE us.user.id = :userId AND us.restaurant.id = :restaurantId")
    void deleteByUserIdAndRestaurantId(long userId, long restaurantId);

    @Query("SELECT us.restaurant.id FROM User_Saved us WHERE us.user.id = :userId")
    List<Integer> findRestaurantIdsByUserId(@Param("userId") Integer userId);
}

