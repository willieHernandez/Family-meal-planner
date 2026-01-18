package com.mealplanner.dto;

import com.mealplanner.model.PantryLot;
import com.mealplanner.model.PantryLotType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PantryLotResponse {

    private String id;
    private String name;
    private PantryLotType type;
    private double quantity;
    private String unit;
    private Map<String, Object> metadata;
    private Instant createdAt;
    private Instant updatedAt;

    public static PantryLotResponse fromEntity(PantryLot entity) {
        return PantryLotResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .metadata(entity.getMetadata())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
