package com.ecom.facultyservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ecom.facultyservice.model.FacultyModel;

public interface FacultyRepository extends MongoRepository<FacultyModel, String> {
    FacultyModel findByEmail(String email);
    boolean existsByEmail(String email);
}