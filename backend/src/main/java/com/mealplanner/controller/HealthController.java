package com.mealplanner.controller;

import com.mealplanner.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${spring.application.version:1.0.0-phase1}")
    private String version;

    @GetMapping
    public ResponseEntity<HealthResponse> getHealth() {
        HealthResponse response = HealthResponse.builder()
                .status("ok")
                .version(version)
                .time(Instant.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
