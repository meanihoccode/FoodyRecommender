package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.repository.User_SavedRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class User_SavedService {
    @Autowired
    User_SavedRepository user_SavedRepository;

    public List<Restaurant> getSavedRestaurantsByUserId(long userId) {
        return user_SavedRepository.findSavedRestaurantsByUserId(userId);
    }
}
