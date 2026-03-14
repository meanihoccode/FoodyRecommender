package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Reservation;
import com.example.foodyrecommender.repository.ReservationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ReservationService {
    @Autowired
    private ReservationRepository reservationRepository;

    public Reservation getReservationById(long reservationId) {
        return reservationRepository.findById(reservationId);
    }
}
