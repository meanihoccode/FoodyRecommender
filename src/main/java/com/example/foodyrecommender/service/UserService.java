package com.example.foodyrecommender.service;

import com.example.foodyrecommender.dto.ChangePasswordRequest;
import com.example.foodyrecommender.entity.User;
import com.example.foodyrecommender.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@Transactional

public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User getUserById(long id) {
        return userRepository.findUserById(id);
    }

    public User getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public User saveUser(User user) {
        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userRepository.save(user);
    }

    public User updateUser(long id, User user) {
        User existingUser = this.getUserById(id);
        if (existingUser == null) {
            throw new RuntimeException("User not found with id: " + id);
        } else {
            existingUser.setFullName(user.getFullName());
            existingUser.setEmail(user.getEmail());
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
            existingUser.setPhone(user.getPhone());
            existingUser.setIsVerified(user.getIsVerified());
            return userRepository.save(existingUser);
        }
    }
    public User findByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    public User changePassword(long id, ChangePasswordRequest request) {
        User existUser = userRepository.findUserById(id);
        if (existUser == null) {
            throw new RuntimeException("User not found with id: " + id);
        } else {
            if (passwordEncoder.matches(request.getOldPassword(), existUser.getPassword())) {
                existUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(existUser);
                return existUser;
            } else  {
                throw new RuntimeException("Incorrect old password");
            }
        }
    }
}
