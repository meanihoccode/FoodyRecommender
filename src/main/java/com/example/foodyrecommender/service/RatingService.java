package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Rating;
import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.repository.RatingRepository;
import com.example.foodyrecommender.repository.ReservationRepository;
import com.example.foodyrecommender.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Thêm thư viện này

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RestaurantRepository restaurantRepository; // Gọi thêm repo của nhà hàng

    @Autowired
    private ReservationRepository reservationRepository;

    @Transactional // BẮT BUỘC PHẢI CÓ: Xử lý đồng thời 2 bảng
    public Rating createRating(Rating rating) {

        // 1. Lưu lại điểm đánh giá vào bảng `ratings` (cho AI đọc)
        Rating savedRating = ratingRepository.save(rating);

        // 2. Tìm nhà hàng đang được đánh giá
        Restaurant restaurant = restaurantRepository.findById(rating.getRestaurant().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà hàng"));

        // Lấy số liệu cũ (Xử lý null để tránh lỗi NullPointerException)
        int currentCount = (restaurant.getRatingCount() != null) ? restaurant.getRatingCount() : 0;
        double currentAvg = (restaurant.getRating() != null) ? restaurant.getRating() : 0.0;

        // 3. Công thức tính điểm trung bình mới cực nhanh:
        // Điểm mới = ((Điểm trung bình cũ * Số người cũ) + Điểm của người mới) / (Số người cũ + 1)
        double newAvg = ((currentAvg * currentCount) + rating.getScore()) / (currentCount + 1);

        // Làm tròn 1 chữ số thập phân (Ví dụ: 4.33333 -> 4.3)
        double roundedAvg = (double) Math.round(newAvg * 10) / 10;

        // 4. Cập nhật vào thực thể nhà hàng và lưu lại bảng `restaurants` (cho Web hiển thị)
        restaurant.setRatingCount(currentCount + 1);
        restaurant.setRating(roundedAvg);
        restaurantRepository.save(restaurant);

        reservationRepository.markAsRated(rating.getReservation().getId());

        return savedRating;
    }
}