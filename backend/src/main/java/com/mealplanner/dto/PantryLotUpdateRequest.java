package com.mealplanner.dto;

import com.mealplanner.model.PantryLotType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PantryLotUpdateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private PantryLotType type;

    @Min(value = 0, message = "Quantity must be non-negative")
    private double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    private Map<String, Object> metadata;
}
