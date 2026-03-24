package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation,Integer> {
    Reservation findById(long id);
    List<Reservation> findByUser(long userId);
    Void deleteById(long id);
}