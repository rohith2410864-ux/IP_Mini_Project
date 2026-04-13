package com.ecom.eventservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "registrations")
public class RegistrationModel {
    @Id
    private String id;
    private String eventId;
    private String userEmail;
    private String userName;
    private String userDepartment;
    private String attendanceStatus;
    private String paymentId;
    private String registeredAt;
    private List<ResponseItem> responses;

    public static class ResponseItem {
        private String label;
        private String answer;

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserDepartment() { return userDepartment; }
    public void setUserDepartment(String userDepartment) { this.userDepartment = userDepartment; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }

    public List<ResponseItem> getResponses() { return responses; }
    public void setResponses(List<ResponseItem> responses) { this.responses = responses; }
}
