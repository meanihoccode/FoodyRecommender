package com.example.foodyrecommender.api;


import com.example.foodyrecommender.entity.Reservation;
import com.example.foodyrecommender.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {
    @Autowired
    ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservation = reservationService.getAllReservations();
        return ResponseEntity.ok(reservation);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable int id) {
        Reservation reservation = reservationService.getReservationById(id);
        if (reservation != null) {
            return ResponseEntity.ok(reservation);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<List<Reservation>> getReservationsByUser(@PathVariable int id) {
        List<Reservation> reservation = reservationService.getReservationsByUser(id);
        if (reservation != null) {
            return ResponseEntity.ok(reservation);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Reservation reservation) {
        try {
            Reservation saved = reservationService.saveReservation(reservation);
            return ResponseEntity.status(201).body(saved);
        } catch (IllegalArgumentException e) {
            // Trả về mã 400 và nội dung lỗi bạn đã viết ở Service
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Các lỗi hệ thống khác thì trả về 500
            return ResponseEntity.status(500).body(Map.of("message", "Có lỗi xảy ra, vui lòng thử lại sau!"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> updateReservation(@PathVariable int id, @RequestBody Reservation reservation) {
        Reservation updatedReservation = reservationService.updateReservation(id, reservation);
        if (updatedReservation != null) {
            return ResponseEntity.ok(updatedReservation);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

// Trong file ReservationController.java

    @PutMapping("/cancellation/{id}")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable int id) {
        // Gọi hàm hủy chuyên biệt từ Service
        Reservation cancelledReservation = reservationService.cancelReservation(id);

        if (cancelledReservation != null) {
            return ResponseEntity.ok(cancelledReservation);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable int id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
