package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.Reservation;
import com.example.foodyrecommender.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface UserRepository   extends JpaRepository<User, Integer>
{
    User findUserByEmail(String email);

    User findUserById(long id);

    // Thêm vào trong UserRepository interface
    User findByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
            "(:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(:keyword) OR u.email LIKE :keyword or u.phone like :keyword) AND " +
            "(:isVerified IS NULL OR u.isVerified = :isVerified) AND "
            + "(:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> searchAndFilter(
            @Param("keyword") String keyword,
            @Param("isVerified") Boolean isVerified,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}