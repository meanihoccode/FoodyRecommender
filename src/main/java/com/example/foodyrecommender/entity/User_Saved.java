package com.example.foodyrecommender.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_saved", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "restaurant_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User_Saved {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    // Khi trả về JSON, chỉ lấy id của user, giấu hết email, fullName... cho nhẹ
    @JsonIgnoreProperties({"email", "password", "role"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "created_at", updatable = false) // Thêm updatable = false để chống bị ghi đè khi update
    private LocalDateTime createdAt;

    // Thần chú của Hibernate
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(); // Tự động lấy giờ hiện tại
    }

}
