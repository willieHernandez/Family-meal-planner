package com.mealplanner.dto;

import com.mealplanner.model.RecipeIngredient;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredientDto {

    @NotBlank(message = "Ingredient name is required")
    private String name;

    @Min(value = 0, message = "Quantity must be non-negative")
    private double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    public static RecipeIngredientDto fromEntity(RecipeIngredient entity) {
        return RecipeIngredientDto.builder()
                .name(entity.getName())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .build();
    }

    public RecipeIngredient toEntity() {
        return RecipeIngredient.builder()
                .name(name)
                .quantity(quantity)
                .unit(unit)
                .build();
    }
}
