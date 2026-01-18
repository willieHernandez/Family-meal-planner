package com.mealplanner.controller;

import com.mealplanner.dto.*;
import com.mealplanner.model.PantryLotType;
import com.mealplanner.service.PantryLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pantry")
@RequiredArgsConstructor
public class PantryController {

    private final PantryLotService pantryLotService;

    @GetMapping
    public ResponseEntity<PantryLotListResponse> listPantryLots(
            @RequestParam(required = false) PantryLotType type,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(pantryLotService.listPantryLots(type, name, limit, offset));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PantryLotResponse> getPantryLot(@PathVariable String id) {
        return ResponseEntity.ok(pantryLotService.getPantryLot(id));
    }

    @PostMapping
    public ResponseEntity<PantryLotResponse> createPantryLot(
            @Valid @RequestBody PantryLotCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pantryLotService.createPantryLot(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PantryLotResponse> updatePantryLot(
            @PathVariable String id,
            @Valid @RequestBody PantryLotUpdateRequest request) {
        return ResponseEntity.ok(pantryLotService.updatePantryLot(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePantryLot(@PathVariable String id) {
        pantryLotService.deletePantryLot(id);
        return ResponseEntity.noContent().build();
    }
}
