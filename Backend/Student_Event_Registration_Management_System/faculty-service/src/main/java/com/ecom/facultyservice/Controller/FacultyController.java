package com.ecom.facultyservice.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ecom.facultyservice.model.FacultyModel;
import com.ecom.facultyservice.service.FacultyService;

@RestController
@RequestMapping("/faculty")
@CrossOrigin(origins = "*")
public class FacultyController {

    @Autowired
    private FacultyService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody FacultyModel faculty) {
        if (faculty.getEmail() == null || faculty.getPassword() == null || faculty.getFacultyId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing required fields");
        }
        if (service.existsByEmail(faculty.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(faculty));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody FacultyModel faculty) {
        String result = service.login(faculty);
        if ("Login Successful".equals(result)) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
}