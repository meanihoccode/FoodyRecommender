package com.example.foodyrecommender.service;

import com.example.foodyrecommender.entity.Reservation;
import com.example.foodyrecommender.repository.ReservationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Reservation saveReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public Reservation updateReservation(long reservationId, Reservation reservation) {
        Reservation existingReservation = reservationRepository.findById(reservationId);
        if (existingReservation != null) {
            existingReservation.setUserId(reservation.getUserId());
            existingReservation.setRestaurantId(reservation.getRestaurantId());
            existingReservation.setBookingDate(reservation.getBookingDate());
            existingReservation.setBookingTime(reservation.getBookingTime());
            existingReservation.setContactName(reservation.getContactName());
            existingReservation.setContactPhone(reservation.getContactPhone());
            existingReservation.setStatus(reservation.getStatus());
            existingReservation.setPartySize(reservation.getPartySize());
            existingReservation.setCreatedAt(reservation.getCreatedAt());
            return reservationRepository.save(existingReservation);
        }
        return null;
    }

    public void deleteReservation(long reservationId) {
        reservationRepository.deleteById(reservationId);
    }
}
