package com.ecom.studentservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.ecom.studentservice.model.StudentModel;

public interface StudentRepository extends MongoRepository<StudentModel, String> {
    StudentModel findByEmail(String email);
    boolean existsByEmail(String email);
}