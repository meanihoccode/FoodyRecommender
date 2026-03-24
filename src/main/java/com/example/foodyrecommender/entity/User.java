package com.example.foodyrecommender.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Column(name = "email", unique = true)
    private String email;

    @NotBlank(message = "Tên không được để trống")
    @Column(name = "full_name")
    private String fullName;


    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    @Column(name = "password")
    private String password;

    @NotBlank(message = "SDT không được để trống")
    @Size(min=10, max=12, message = "SDT phải từ 10-12 số")
    @Column(name="phone")
    private String phone;

    @Column(name="is_verified")
    private Boolean isVerified;
}
