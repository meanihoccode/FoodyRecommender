package com.example.foodyrecommender.repository;

import com.example.foodyrecommender.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository   extends JpaRepository<User, Integer>
{
    User findUserByUsername(String username);
    User findUserByEmail(String email);
}