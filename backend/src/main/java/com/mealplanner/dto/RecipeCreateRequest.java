package com.mealplanner.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeCreateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotEmpty(message = "At least one ingredient is required")
    @Valid
    private List<RecipeIngredientDto> ingredients;

    @NotEmpty(message = "At least one instruction is required")
    private List<String> instructions;

    @Min(value = 1, message = "Servings must be at least 1")
    private int servings;

    private List<String> tags;
}
