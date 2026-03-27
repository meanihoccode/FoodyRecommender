package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation,Integer> {
    Reservation findById(long id);

    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId")
    List<Reservation> findByUser(long userId);
}