package com.ecom.facultyservice.util;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class JwtUtil {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String SECRET = System.getenv().getOrDefault("JWT_SECRET", "dev-secret-key-change-me");

    public static String generateToken(String email, String role) {
        try {
            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            long now = Instant.now().getEpochSecond();
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", email);
            payload.put("role", role);
            payload.put("iat", now);
            payload.put("exp", now + 86400);
            String payloadJson = MAPPER.writeValueAsString(payload);

            String header = base64Url(headerJson.getBytes(StandardCharsets.UTF_8));
            String body = base64Url(payloadJson.getBytes(StandardCharsets.UTF_8));
            String signature = hmacSha256(header + "." + body, SECRET);
            return header + "." + body + "." + signature;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate JWT", ex);
        }
    }

    private static String hmacSha256(String data, String secret) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmac.init(key);
        byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64Url(hash);
    }

    private static String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
