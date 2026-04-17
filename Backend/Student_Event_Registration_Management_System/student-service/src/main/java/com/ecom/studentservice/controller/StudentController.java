package com.ecom.studentservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ecom.studentservice.model.StudentModel;
import com.ecom.studentservice.service.StudentService;
import com.ecom.studentservice.util.JwtUtil;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class StudentController {

    @Autowired
    private StudentService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody StudentModel student) {
        if (student.getEmail() == null || student.getPassword() == null || student.getRollNumber() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing required fields");
        }
        if (service.existsByEmail(student.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(student));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody StudentModel student) {
        String result = service.login(student);
        if ("Login Successful".equals(result)) {
            String token = JwtUtil.generateToken(student.getEmail(), "user");
            return ResponseEntity.ok(Map.of("token", token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", result));
    }
}