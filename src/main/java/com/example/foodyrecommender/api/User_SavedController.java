package com.example.foodyrecommender.api;


import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.entity.User_Saved;
import com.example.foodyrecommender.service.User_SavedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-saved")
@CrossOrigin(origins = "*")
public class User_SavedController {
    @Autowired
    private User_SavedService user_savedService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Restaurant>> getSavedRestaurantsByUserId(@PathVariable int userId) {
        List<Restaurant> savedRestaurants = user_savedService.getSavedRestaurantsByUserId(userId);
        return ResponseEntity.ok(savedRestaurants);
    }

    @PostMapping
    public ResponseEntity<User_Saved> createSavedRestaurant(@RequestBody User_Saved user_saved) {
        User_Saved userSaved = user_savedService.saveRestaurantForUser(user_saved);
        return ResponseEntity.status(201).body(userSaved);
    }

    @DeleteMapping("/{userId}/{restaurantId}")
    public ResponseEntity<Void> deleteUser_Saved(@PathVariable int userId, @PathVariable int restaurantId) {
        user_savedService.deleteUser_Saved(userId, restaurantId);
        return ResponseEntity.noContent().build();
    }

}
