package com.ecom.eventservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "events")
public class EventModel {

    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("id")
    private String id;
    private String title;
    private String venue;
    private String startDate;
    private String endDate;
    private String time;
    private String category;
    private String type;
    private String status;
    private Boolean isPaid;
    private Double amount;
    private Boolean isTeamEvent;
    private Integer minTeamSize;
    private Integer maxTeamSize;
    private Integer maxSeats;
    private String registrationDeadline;
    private String paymentInfo;
    private String posterUrl;
    private List<String> departments;
    private Map<String, Object> externalLink;
    private List<Map<String, Object>> customFormFields;

    // Legacy fields kept for backward compatibility
    private String studentName;
    private String rollNumber;
    private String description;
    private String facultyId;
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Boolean getIsTeamEvent() { return isTeamEvent; }
    public void setIsTeamEvent(Boolean isTeamEvent) { this.isTeamEvent = isTeamEvent; }

    public Integer getMinTeamSize() { return minTeamSize; }
    public void setMinTeamSize(Integer minTeamSize) { this.minTeamSize = minTeamSize; }

    public Integer getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(Integer maxTeamSize) { this.maxTeamSize = maxTeamSize; }

    public Integer getMaxSeats() { return maxSeats; }
    public void setMaxSeats(Integer maxSeats) { this.maxSeats = maxSeats; }

    public String getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(String registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public String getPaymentInfo() { return paymentInfo; }
    public void setPaymentInfo(String paymentInfo) { this.paymentInfo = paymentInfo; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public List<String> getDepartments() { return departments; }
    public void setDepartments(List<String> departments) { this.departments = departments; }

    public Map<String, Object> getExternalLink() { return externalLink; }
    public void setExternalLink(Map<String, Object> externalLink) { this.externalLink = externalLink; }

    public List<Map<String, Object>> getCustomFormFields() { return customFormFields; }
    public void setCustomFormFields(List<Map<String, Object>> customFormFields) { this.customFormFields = customFormFields; }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getEventName() { return title; }
    public void setEventName(String eventName) { this.title = eventName; }

    public String getLocation() { return venue; }
    public void setLocation(String location) { this.venue = location; }

    public String getDate() { return startDate; }
    public void setDate(String date) { this.startDate = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }
}