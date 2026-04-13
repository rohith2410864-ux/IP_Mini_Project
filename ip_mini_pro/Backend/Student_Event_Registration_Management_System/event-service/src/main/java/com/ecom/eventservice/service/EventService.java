package com.ecom.eventservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.ecom.eventservice.model.EventModel;
import com.ecom.eventservice.repository.EventRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository repo;

    public EventModel addEvent(EventModel event) {
        return repo.save(event);
    }

    public List<EventModel> getByMonth(String month) {
        return repo.findByDateContaining(month);
    }

    public List<EventModel> getByStudent(String rollNumber) {
        return repo.findByRollNumber(rollNumber);
    }

    public List<EventModel> getAll() {
        return repo.findAll();
    }

    public Optional<EventModel> getById(String id) {
        return repo.findById(id);
    }

    public String updateEvent(String id, EventModel event) {
        EventModel existing = repo.findById(id).orElse(null);

        if (existing != null && existing.getFacultyId().equals(event.getFacultyId())) {
            event.setId(id);
            repo.save(event);
            return "Updated Successfully";
        }
        return "Access Denied";
    }

    public String deleteEvent(String id, String facultyId) {
        EventModel existing = repo.findById(id).orElse(null);

        if (existing != null && existing.getFacultyId().equals(facultyId)) {
            repo.deleteById(id);
            return "Deleted Successfully";
        }
        return "Access Denied";
    }

    public EventModel updateEventById(String id, EventModel event) {
        event.setId(id);
        return repo.save(event);
    }

    public void deleteEventById(String id) {
        repo.deleteById(id);
    }
}