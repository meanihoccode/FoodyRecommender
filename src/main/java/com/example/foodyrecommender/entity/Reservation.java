package com.example.foodyrecommender.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "restaurant_id")
    private Integer restaurantId;

    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @Column(name="booking_time")
    private LocalTime bookingTime;

    @Column(name="party_size")
    private Integer partySize;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name="contact_phone")
    private String contactPhone;

    @Column(name = "status")
    private String status; // e.g., "CONFIRMED", "CANCELLED", "PENDING"

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
