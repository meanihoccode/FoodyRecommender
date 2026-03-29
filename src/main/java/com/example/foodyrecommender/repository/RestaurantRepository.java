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
}
