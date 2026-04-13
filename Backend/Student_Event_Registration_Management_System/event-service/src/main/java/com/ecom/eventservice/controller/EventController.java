package com.ecom.eventservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Optional;

import com.ecom.eventservice.model.EventModel;
import com.ecom.eventservice.model.RegistrationModel;
import com.ecom.eventservice.service.EventService;
import com.ecom.eventservice.service.RegistrationService;

@RestController
@RequestMapping("/event")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventService service;

    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/add")
    public EventModel addEvent(@RequestBody EventModel event) {
        return service.addEvent(event);
    }

    @GetMapping("/month/{month}")
    public List<EventModel> getByMonth(@PathVariable String month) {
        return service.getByMonth(month);
    }

    @GetMapping("/student/{rollNumber}")
    public List<EventModel> getByStudent(@PathVariable String rollNumber) {
        return service.getByStudent(rollNumber);
    }

    @PutMapping("/update/{id}")
    public String updateEvent(@PathVariable String id, @RequestBody EventModel event) {
        return service.updateEvent(id, event);
    }

    @DeleteMapping("/delete/{id}/{facultyId}")
    public String deleteEvent(@PathVariable String id, @PathVariable String facultyId) {
        return service.deleteEvent(id, facultyId);
    }

    // Compatibility endpoints for frontend routes
    @GetMapping("/all")
    public List<EventModel> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public EventModel getById(@PathVariable String id) {
        return service.getById(id).orElse(null);
    }

    @GetMapping("/admin/dashboard/stats")
    public Map<String, Object> getAdminStats() {
        return Map.of(
            "totalEvents", service.getAll().size(),
            "totalParticipants", 0,
            "departmentParticipation", Collections.emptyList()
        );
    }

    @GetMapping("/events/my-registrations")
    public ResponseEntity<?> getMyRegistrations(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String userEmail = extractEmailFromToken(authHeader);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        List<RegistrationModel> rows = registrationService.getByUserEmail(userEmail);
        List<Map<String, Object>> data = new ArrayList<>();
        for (RegistrationModel row : rows) {
            data.add(toRegistrationView(row));
        }
        return ResponseEntity.ok(data);
    }

    @GetMapping("/registrations")
    public List<Map<String, Object>> getRegistrations() {
        List<Map<String, Object>> data = new ArrayList<>();
        for (RegistrationModel row : registrationService.getAll()) {
            data.add(toRegistrationView(row));
        }
        return data;
    }

    @PostMapping("/events/{id}/register")
    public ResponseEntity<?> registerForEvent(
        @PathVariable String id,
        @RequestBody Map<String, Object> payload,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String userEmail = extractEmailFromToken(authHeader);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        if (service.getById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Event not found"));
        }
        if (registrationService.getByEventAndUser(id, userEmail) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Already registered for this event"));
        }

        String role = extractRoleFromToken(authHeader);
        String userName = userEmail;
        String userDepartment = "N/A";
        if ("student".equals(role)) {
            userName = userEmail.split("@")[0];
            userDepartment = "CSE";
        } else if ("faculty".equals(role)) {
            userName = userEmail.split("@")[0];
            userDepartment = "FACULTY";
        }

        String paymentId = payload.get("paymentId") != null ? String.valueOf(payload.get("paymentId")) : "N/A";
        List<RegistrationModel.ResponseItem> responses = new ArrayList<>();
        Object responsesObj = payload.get("responses");
        if (responsesObj instanceof List<?>) {
            for (Object item : (List<?>) responsesObj) {
                if (item instanceof Map<?, ?>) {
                    Map<?, ?> itemMap = (Map<?, ?>) item;
                    RegistrationModel.ResponseItem responseItem = new RegistrationModel.ResponseItem();
                    Object labelValue = itemMap.get("label");
                    Object answerValue = itemMap.get("answer");
                    responseItem.setLabel(labelValue == null ? "" : String.valueOf(labelValue));
                    responseItem.setAnswer(answerValue == null ? "" : String.valueOf(answerValue));
                    responses.add(responseItem);
                }
            }
        }

        RegistrationModel saved = registrationService.create(id, userEmail, userName, userDepartment, paymentId, responses);
        return ResponseEntity.status(HttpStatus.CREATED).body(toRegistrationView(saved));
    }

    @DeleteMapping("/events/{id}/withdraw")
    public ResponseEntity<?> withdrawRegistration(
        @PathVariable String id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String userEmail = extractEmailFromToken(authHeader);
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        registrationService.withdraw(id, userEmail);
        return ResponseEntity.ok(Map.of("message", "Withdrawn successfully"));
    }

    @GetMapping("/events")
    public List<EventModel> listEventsCompat() {
        return service.getAll();
    }

    @GetMapping("/events/{id}")
    public EventModel getEventCompat(@PathVariable String id) {
        return service.getById(id).orElse(null);
    }

    @PostMapping("/events")
    public EventModel createEventCompat(@RequestBody EventModel event) {
        return service.addEvent(event);
    }

    @PutMapping("/events/{id}")
    public EventModel updateEventCompat(@PathVariable String id, @RequestBody EventModel event) {
        return service.updateEventById(id, event);
    }

    @DeleteMapping("/events/{id}")
    public Map<String, String> deleteEventCompat(@PathVariable String id) {
        service.deleteEventById(id);
        return Map.of("message", "Deleted Successfully");
    }

    private String extractEmailFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        String[] parts = token.split(":", 2);
        if (parts.length != 2 || parts[1].isBlank()) {
            return null;
        }
        return parts[1];
    }

    private String extractRoleFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return "";
        }
        String token = authHeader.substring(7);
        String[] parts = token.split(":", 2);
        return parts.length > 0 ? parts[0] : "";
    }

    private Map<String, Object> toRegistrationView(RegistrationModel row) {
        Map<String, Object> view = new HashMap<>();
        view.put("_id", row.getId());
        Optional<EventModel> event = service.getById(row.getEventId());
        view.put("eventId", event.orElse(null));
        Map<String, Object> user = new HashMap<>();
        user.put("name", row.getUserName());
        user.put("email", row.getUserEmail());
        user.put("department", row.getUserDepartment());
        view.put("userId", user);
        view.put("attendanceStatus", row.getAttendanceStatus());
        view.put("responses", row.getResponses() == null ? Collections.emptyList() : row.getResponses());
        return view;
    }
}