package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class RestaurantService {
    @Autowired
    private RestaurantRepository restaurantRepository;

    public Restaurant getRestaurantById(long id) {
        return restaurantRepository.findRestaurantById(id);
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant updateRestaurant(long id, Restaurant restaurant) {
        Restaurant existingRestaurant = restaurantRepository.findRestaurantById(id);
        if (existingRestaurant != null) {
            existingRestaurant.setName(restaurant.getName());
            existingRestaurant.setAddress(restaurant.getAddress());
            existingRestaurant.setCategory(restaurant.getCategory());
            existingRestaurant.setPriceAverage(restaurant.getPriceAverage());
            existingRestaurant.setDescription(restaurant.getDescription());
            existingRestaurant.setImageUrl(restaurant.getImageUrl());
            existingRestaurant.setRating(restaurant.getRating());
            return restaurantRepository.save(existingRestaurant);
        }
        return null;
    }

    public void deleteRestaurant(int id) {
        restaurantRepository.deleteById(id);
    }

}
