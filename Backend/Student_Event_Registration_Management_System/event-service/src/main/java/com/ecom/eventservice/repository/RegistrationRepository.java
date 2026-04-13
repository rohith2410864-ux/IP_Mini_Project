package com.ecom.eventservice.repository;

import com.ecom.eventservice.model.RegistrationModel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RegistrationRepository extends MongoRepository<RegistrationModel, String> {
    List<RegistrationModel> findByUserEmail(String userEmail);
    List<RegistrationModel> findByEventId(String eventId);
    RegistrationModel findByEventIdAndUserEmail(String eventId, String userEmail);
    void deleteByEventIdAndUserEmail(String eventId, String userEmail);
}
