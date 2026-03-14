package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant,Integer> {
    Restaurant findByName(String name);
    Restaurant findRestaurantById(Long id);
}