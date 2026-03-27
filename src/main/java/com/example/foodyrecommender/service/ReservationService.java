package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Reservation;
import com.example.foodyrecommender.repository.ReservationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@Transactional
public class ReservationService {
    @Autowired
    private ReservationRepository reservationRepository;

    public Reservation getReservationById(long reservationId) {
        return reservationRepository.findById(reservationId);
    }

    public List<Reservation> getReservationsByUserId(long userId) {
        return reservationRepository.findByUser(userId);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // --- HÀM KIỂM TRA DÙNG CHUNG ---
    private void validateBookingTime(Reservation reservation) {
        // 1. Lấy giờ hiện tại của Việt Nam và CHUYỂN VỀ kiểu LocalDateTime
        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime();

        // 2. Gộp ngày và giờ đặt của khách
        LocalDateTime bookingDateTime = LocalDateTime.of(reservation.getBookingDate(), reservation.getBookingTime());

        // 3. Bây giờ cả 2 đã cùng kiểu LocalDateTime, so sánh thoải mái rồi!
        if (bookingDateTime.isBefore(now)) {
            throw new IllegalArgumentException("Ngày giờ đặt bàn không hợp lệ. Phải lớn hơn thời gian hiện tại!");
        }
    }

    // --- 1. HÀM TẠO MỚI (Đây là cái bạn đang gọi từ Frontend) ---
    public Reservation saveReservation(Reservation reservation) {
        validateBookingTime(reservation); // Chặn ở đây nè!
        return reservationRepository.save(reservation);
    }

    // --- 2. HÀM CẬP NHẬT ---
    public Reservation updateReservation(long reservationId, Reservation reservation) {
        Reservation existingReservation = reservationRepository.findById(reservationId);
        if (existingReservation != null) {
            // Check thời gian trước khi cho sửa
            validateBookingTime(reservation);

            existingReservation.setUser(reservation.getUser());
            existingReservation.setRestaurant(reservation.getRestaurant());
            existingReservation.setBookingDate(reservation.getBookingDate());
            existingReservation.setBookingTime(reservation.getBookingTime());
            existingReservation.setContactName(reservation.getContactName());
            existingReservation.setContactPhone(reservation.getContactPhone());
            existingReservation.setStatus(reservation.getStatus());
            existingReservation.setPartySize(reservation.getPartySize());

            // LƯU Ý: Không nên cập nhật createdAt ở đây nhé, vì nó là ngày tạo đơn ban đầu
            // existingReservation.setCreatedAt(reservation.getCreatedAt());

            return reservationRepository.save(existingReservation);
        }
        return null;
    }

    public void deleteReservation(int reservationId) {
        reservationRepository.deleteById(reservationId);
    }
}
