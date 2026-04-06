package com.example.foodyrecommender.api;

import com.example.foodyrecommender.entity.Rating;
import com.example.foodyrecommender.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
public class RatingController {
    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<Rating> addRating(@RequestBody Rating rating) {
        Rating rating1 = ratingService.createRating(rating);
        return ResponseEntity.ok(rating1);
    }
}
