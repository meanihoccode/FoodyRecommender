package com.example.foodyrecommender.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "Ngày đặt không được để trống")
    @FutureOrPresent(message = "Ngày đặt bàn phải từ hôm nay trở đi")
    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @NotNull(message = "Giờ đặt không được để trống")
    @Column(name="booking_time")
    private LocalTime bookingTime;

    @NotNull(message = "Số người không được để trống")
    @Column(name="party_size")
    private Integer partySize;

    @Column(name = "contact_name")
    private String contactName;

    @NotBlank(message = "SDT đặt bàn không được trống")
    @Column(name="contact_phone")
    private String contactPhone;

    // Đã sửa: Thêm @Builder.Default để Lombok không bỏ qua giá trị này
    @Builder.Default
    @Column(name = "status")
    private String status = "Chờ xác nhận";

    // Đã sửa: Giữ lại đúng 1 trường createdAt này thôi
    @Column(name = "created_at", updatable = false) // Thêm updatable = false để chống bị ghi đè khi update
    private LocalDateTime createdAt;

    // Thần chú của Hibernate
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(); // Tự động lấy giờ hiện tại

        // Cẩn tắc vô áy náy: Nếu status vẫn bị null thì ép lại lần nữa
        if (this.status == null) {
            this.status = "Chờ xác nhận";
        }
    }
}