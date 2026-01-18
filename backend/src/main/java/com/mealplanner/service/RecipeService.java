package com.mealplanner.service;

import com.mealplanner.dto.*;
import com.mealplanner.exception.ResourceNotFoundException;
import com.mealplanner.model.Recipe;
import com.mealplanner.model.RecipeIngredient;
import com.mealplanner.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;

    public RecipeListResponse listRecipes(String tag, String name, int limit, int offset) {
        Pageable pageable = PageRequest.of(offset / limit, limit, Sort.by(Sort.Direction.DESC, "updatedAt"));

        Page<Recipe> page;
        if (tag != null && !tag.isBlank() && name != null && !name.isBlank()) {
            page = recipeRepository.findByTagAndNameContaining(tag, name, pageable);
        } else if (tag != null && !tag.isBlank()) {
            page = recipeRepository.findByTagsContaining(tag, pageable);
        } else if (name != null && !name.isBlank()) {
            page = recipeRepository.findByNameContaining(name, pageable);
        } else {
            page = recipeRepository.findAll(pageable);
        }

        return RecipeListResponse.builder()
                .items(page.getContent().stream().map(RecipeResponse::fromEntity).toList())
                .total(page.getTotalElements())
                .build();
    }

    public RecipeResponse getRecipe(String id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", id));
        return RecipeResponse.fromEntity(recipe);
    }

    public RecipeResponse createRecipe(RecipeCreateRequest request) {
        List<RecipeIngredient> ingredients = request.getIngredients().stream()
                .map(RecipeIngredientDto::toEntity)
                .toList();

        Recipe recipe = Recipe.builder()
                .name(request.getName())
                .nameNormalized(normalizeName(request.getName()))
                .ingredients(ingredients)
                .instructions(request.getInstructions())
                .servings(request.getServings())
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .build();

        Recipe saved = recipeRepository.save(recipe);
        return RecipeResponse.fromEntity(saved);
    }

    public RecipeResponse updateRecipe(String id, RecipeUpdateRequest request) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", id));

        List<RecipeIngredient> ingredients = request.getIngredients().stream()
                .map(RecipeIngredientDto::toEntity)
                .toList();

        recipe.setName(request.getName());
        recipe.setNameNormalized(normalizeName(request.getName()));
        recipe.setIngredients(ingredients);
        recipe.setInstructions(request.getInstructions());
        recipe.setServings(request.getServings());
        recipe.setTags(request.getTags() != null ? request.getTags() : List.of());

        Recipe saved = recipeRepository.save(recipe);
        return RecipeResponse.fromEntity(saved);
    }

    public void deleteRecipe(String id) {
        if (!recipeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recipe", id);
        }
        recipeRepository.deleteById(id);
    }

    private String normalizeName(String name) {
        return name != null ? name.toLowerCase(Locale.ROOT).trim() : null;
    }
}
