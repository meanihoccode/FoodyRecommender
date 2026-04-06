package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Reservation;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation,Integer> {
    Reservation findById(long id);

    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId")
    List<Reservation> findByUser(long userId);

    Reservation getReservationById(int id);
    // Thêm hàm này: Cập nhật thẳng xuống DB, bỏ qua Validation
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Reservation r SET r.status = 'CANCELLED' WHERE r.id = :id")
    void cancelReservationDirectly(@Param("id") int id);
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Reservation r SET r.status = 'CONFIRMED' WHERE r.id = :id")
    void confirmReservationDirectly(@Param("id") int id);
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Reservation r SET r.status = 'COMPLETED' WHERE r.id = :id")
    void completeReservationDirectly(@Param("id") int id);

    @Modifying
    @Query("UPDATE Reservation r SET r.isRated = true WHERE r.id = :id")
    void markAsRated(@Param("id") int id);

        // Câu lệnh SQL "thần thánh" xử lý mọi trường hợp tìm kiếm
        @Query("SELECT r FROM Reservation r WHERE " +
                "(:keyword IS NULL OR LOWER(r.contactName) LIKE LOWER(:keyword) OR r.contactPhone LIKE :keyword) AND " +
                "(:status IS NULL OR r.status = :status) AND " +
                "(CAST(:startDate AS date) IS NULL OR r.bookingDate >= :startDate) AND " +
                "(CAST(:endDate AS date) IS NULL OR r.bookingDate <= :endDate)")
        Page<Reservation> searchAndFilter(
                @Param("keyword") String keyword,
                @Param("status") String status,
                @Param("startDate") LocalDate startDate,
                @Param("endDate") LocalDate endDate,
                Pageable pageable
        );

}