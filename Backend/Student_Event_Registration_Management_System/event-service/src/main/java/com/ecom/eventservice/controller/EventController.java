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
import java.util.Base64;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.ecom.eventservice.model.EventModel;
import com.ecom.eventservice.model.RegistrationModel;
import com.ecom.eventservice.service.EventService;
import com.ecom.eventservice.service.RegistrationService;

@RestController
@RequestMapping("/api")
public class EventController {

    @Autowired
    private EventService service;

    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/events")
    public EventModel addEvent(@RequestBody EventModel event) {
        return service.addEvent(event);
    }

    @GetMapping("/events/month/{month}")
    public List<EventModel> getByMonth(@PathVariable String month) {
        return service.getByMonth(month);
    }

    @GetMapping("/events/student/{rollNumber}")
    public List<EventModel> getByStudent(@PathVariable String rollNumber) {
        return service.getByStudent(rollNumber);
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(
        @PathVariable String id, 
        @RequestBody EventModel event,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String role = extractRoleFromToken(authHeader);
        if (!"admin".equals(role) && !"faculty".equals(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized to update"));
        }
        
        Optional<EventModel> existing = service.getById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Event not found"));
        }

        // If faculty, verify they own the event (optional, depending on requirements)
        // For now, allow any admin/faculty to update since the system is small
        
        EventModel updated = service.updateEventById(id, event);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(
        @PathVariable String id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String role = extractRoleFromToken(authHeader);
        if (!"admin".equals(role) && !"faculty".equals(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized to delete"));
        }
        Optional<EventModel> existing = service.getById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Event not found"));
        }
        service.deleteEventById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted Successfully"));
    }

    // Compatibility endpoints for frontend routes
    @GetMapping("/events")
    public List<EventModel> getAll() {
        return service.getAll();
    }

    @GetMapping("/events/{id}")
    public EventModel getById(@PathVariable String id) {
        return service.getById(id).orElse(null);
    }

    @GetMapping("/admin/dashboard/stats")
    public Map<String, Object> getAdminStats() {
        List<EventModel> allEvents = service.getAll();
        List<RegistrationModel> allRegs = registrationService.getAll();
        
        // Calculate department stats (Innovative replacement for Active Depts)
        java.util.Map<String, Long> deptCounts = allRegs.stream()
            .filter(r -> r.getUserDepartment() != null && !r.getUserDepartment().isEmpty())
            .collect(Collectors.groupingBy(RegistrationModel::getUserDepartment, Collectors.counting()));
        
        List<Map<String, Object>> deptStats = deptCounts.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("department", e.getKey());
                m.put("count", e.getValue());
                return m;
            })
            .collect(Collectors.toList());

        // Innovative Field: Spotlight Event (Top event by registrations)
        String topEvent = allEvents.stream()
            .max((e1, e2) -> {
                long c1 = allRegs.stream().filter(r -> r.getEventId().equals(e1.getId())).count();
                long c2 = allRegs.stream().filter(r -> r.getEventId().equals(e2.getId())).count();
                return Long.compare(c1, c2);
            })
            .map(EventModel::getTitle)
            .orElse("No events yet");

        // Innovative Field: Engagement Score (Avg participants per event)
        double score = allEvents.isEmpty() ? 0 : (double)allRegs.size() / allEvents.size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", allEvents.size());
        stats.put("totalParticipants", allRegs.size());
        stats.put("departmentParticipation", deptStats);
        stats.put("topEvent", topEvent);
        stats.put("engagementScore", String.format("%.1f", score));
        
        return stats;
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

    private Map<String, Object> extractTokenPayload(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return com.ecom.eventservice.util.JwtUtil.validateAndExtractPayload(authHeader.substring(7));
    }

    private String extractEmailFromToken(String authHeader) {
        Map<String, Object> payload = extractTokenPayload(authHeader);
        if (payload == null || !payload.containsKey("sub")) return null;
        return String.valueOf(payload.get("sub"));
    }

    private String extractRoleFromToken(String authHeader) {
        Map<String, Object> payload = extractTokenPayload(authHeader);
        if (payload == null || !payload.containsKey("role")) return "";
        return String.valueOf(payload.get("role"));
    }

    private Map<String, Object> toRegistrationView(RegistrationModel row) {
        Map<String, Object> view = new HashMap<>();
        view.put("id", row.getId());
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