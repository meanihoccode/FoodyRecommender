package com.example.foodyrecommender.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.type.SqlTypes;
import org.hibernate.annotations.JdbcTypeCode;

@Entity
@Table(name = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {
    @Id
    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(name = "similar_restaurant_ids")
    @JdbcTypeCode(SqlTypes.JSON)
    private String similarRestaurantIds;
}
