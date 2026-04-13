package com.ecom.eventservice.service;

import com.ecom.eventservice.model.RegistrationModel;
import com.ecom.eventservice.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class RegistrationService {
    @Autowired
    private RegistrationRepository registrationRepository;

    public List<RegistrationModel> getAll() {
        return registrationRepository.findAll();
    }

    public List<RegistrationModel> getByUserEmail(String userEmail) {
        return registrationRepository.findByUserEmail(userEmail);
    }

    public RegistrationModel getByEventAndUser(String eventId, String userEmail) {
        return registrationRepository.findByEventIdAndUserEmail(eventId, userEmail);
    }

    public RegistrationModel create(
        String eventId,
        String userEmail,
        String userName,
        String userDepartment,
        String paymentId,
        List<RegistrationModel.ResponseItem> responses
    ) {
        RegistrationModel registration = new RegistrationModel();
        registration.setEventId(eventId);
        registration.setUserEmail(userEmail);
        registration.setUserName(userName);
        registration.setUserDepartment(userDepartment);
        registration.setPaymentId(paymentId);
        registration.setAttendanceStatus("pending");
        registration.setRegisteredAt(Instant.now().toString());
        registration.setResponses(responses);
        return registrationRepository.save(registration);
    }

    public void withdraw(String eventId, String userEmail) {
        registrationRepository.deleteByEventIdAndUserEmail(eventId, userEmail);
    }
}
