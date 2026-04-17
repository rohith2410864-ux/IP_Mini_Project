package com.ecom.eventservice.util;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

public class JwtUtil {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String SECRET = System.getenv().getOrDefault("JWT_SECRET", "dev-secret-key-change-me");

    public static Map<String, Object> validateAndExtractPayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }
            
            String header = parts[0];
            String body = parts[1];
            String signature = parts[2];
            
            String expectedSignature = hmacSha256(header + "." + body, SECRET);
            if (!expectedSignature.equals(signature)) {
                return null; // Invalid signature
            }
            
            String payloadJson = new String(Base64.getUrlDecoder().decode(body), StandardCharsets.UTF_8);
            return MAPPER.readValue(payloadJson, Map.class);
        } catch (Exception ex) {
            return null;
        }
    }

    private static String hmacSha256(String data, String secret) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmac.init(key);
        byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }
}
