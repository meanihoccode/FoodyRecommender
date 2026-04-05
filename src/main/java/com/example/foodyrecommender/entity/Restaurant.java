package com.example.foodyrecommender.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @NotBlank(message = "Tên nhà hàng không được trống")
    @Column(name = "name")
    private String name;

    @Column(name="description")
    private String description;

    @NotBlank(message = "Loại hình không được trống")
    @Column(name = "category")
    private String category;

    @NotBlank(message = "Giá trung bình không được trống")
    @DecimalMin(value = "0.1", message = "Giá TB phải lớn hơn hoặc bằng 0")
    @Column(name = "price_average")
    private String priceAverage;

    @NotBlank(message = "Địa chỉ không được trống")
    @Column(name = "address")
    private String address;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "rating")
    private Double rating = 0.0;

    // Bổ sung thêm biến đếm lượt đánh giá
    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Column(name = "min_price")
    private Integer minPrice;
}
