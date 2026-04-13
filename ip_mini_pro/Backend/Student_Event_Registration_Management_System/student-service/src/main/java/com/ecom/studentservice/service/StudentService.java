package com.ecom.studentservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ecom.studentservice.model.StudentModel;
import com.ecom.studentservice.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    public StudentModel register(StudentModel student) {
        return repo.save(student);
    }

    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    public String login(StudentModel student) {
        StudentModel s = repo.findByEmail(student.getEmail());

        if (s != null && s.getPassword().equals(student.getPassword())) {
            return "Login Successful";
        }
        return "Invalid Credentials";
    }
}