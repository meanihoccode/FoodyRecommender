package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Reservation;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}