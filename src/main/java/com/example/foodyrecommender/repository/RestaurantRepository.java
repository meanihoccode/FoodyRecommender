package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Restaurant;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant,Integer> {
    Restaurant findByName(String name);
    Restaurant findRestaurantById(Long id);

    @Query("SELECT r FROM Restaurant r WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            // SỬA DÒNG DƯỚI ĐÂY: Dùng LIKE thay vì dấu = cho Category
            "AND (:category IS NULL OR :category = '' OR LOWER(r.category) LIKE LOWER(CONCAT('%', :category, '%')))")
    Page<Restaurant> searchRestaurants(@Param("keyword") String keyword, @Param("category") String category, Pageable pageable);
    @Modifying
    @Transactional
    @Query("UPDATE Restaurant r SET r.minPrice = :minPrice WHERE r.id = :id")
    void updateMinPriceDirectly(Integer id, Integer minPrice);

    /**
     * HÀM PHỤC VỤ CHO AI RECOMMENDER (COLD-START)
     * Ý nghĩa tên hàm:
     * - findTop4: Lấy ra đúng 4 kết quả đứng đầu (LIMIT 4)
     * - By: Điều kiện lọc (ở đây không có điều kiện WHERE nào, lấy toàn bộ)
     * - OrderByRatingDesc: Sắp xếp theo cột 'rating' giảm dần (từ 5 sao xuống thấp nhất)
     */
    List<Restaurant> findTop4ByOrderByRatingDesc();
}
