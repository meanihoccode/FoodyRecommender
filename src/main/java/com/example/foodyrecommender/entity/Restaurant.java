package com.example.foodyrecommender.entity;

import jakarta.persistence.*;
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

    @Column(name = "name")
    private String name;

    @Column(name="description")
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "price_average")
    private String priceAverage;

    @Column(name = "address")
    private String address;

    @Column(name = "image_url")
    private String imageUrl;
}
