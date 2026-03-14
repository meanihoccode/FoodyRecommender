package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation,Integer> {
    Reservation findById(long id);
}