package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class RestaurantService {
    @Autowired
    private RestaurantRepository restaurantRepository;

    public Restaurant getRestaurantById(long id) {
        return restaurantRepository.findRestaurantById(id);
    }
}
