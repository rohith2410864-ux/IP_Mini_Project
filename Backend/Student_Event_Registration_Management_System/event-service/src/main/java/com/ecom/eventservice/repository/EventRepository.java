package com.ecom.eventservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import com.ecom.eventservice.model.EventModel;

public interface EventRepository extends MongoRepository<EventModel, String> {

    List<EventModel> findByDateContaining(String month);
    List<EventModel> findByRollNumber(String rollNumber);
}