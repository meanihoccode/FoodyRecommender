package com.example.foodyrecommender.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @NotBlank(message = "Ngày đặt không được trống")
    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @NotBlank(message = "Giờ đặt không được trống")
    @Column(name="booking_time")
    private LocalTime bookingTime;

    @NotBlank(message = "Số người không được trống")
    @Column(name="party_size")
    private Integer partySize;

    @Column(name = "contact_name")
    private String contactName;

    @NotBlank(message = "SDT đặt bàn không được trống")
    @Column(name="contact_phone")
    private String contactPhone;

    @Column(name = "status")
    private String status; // e.g., "CONFIRMED", "CANCELLED", "PENDING"

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
