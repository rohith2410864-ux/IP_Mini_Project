package com.ecom.facultyservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ecom.facultyservice.model.FacultyModel;
import com.ecom.facultyservice.repository.FacultyRepository;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository repo;

    public FacultyModel register(FacultyModel faculty) {
        return repo.save(faculty);
    }

    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    public String login(FacultyModel faculty) {
        FacultyModel f = repo.findByEmail(faculty.getEmail());

        if (f != null && f.getPassword().equals(faculty.getPassword())) {
            return "Login Successful";
        }
        return "Invalid Credentials";
    }
}