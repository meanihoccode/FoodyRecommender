package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.entity.User_Saved;
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

    public User_Saved saveRestaurantForUser(User_Saved user_saved) {
        return user_SavedRepository.save(user_saved);
    }

    public void deleteUser_Saved(long userId, long restaurantId) {
        user_SavedRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
    }
}
