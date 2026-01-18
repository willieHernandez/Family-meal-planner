package com.mealplanner.service;

import com.mealplanner.dto.*;
import com.mealplanner.exception.ResourceNotFoundException;
import com.mealplanner.model.Recipe;
import com.mealplanner.model.RecipeIngredient;
import com.mealplanner.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final MongoTemplate mongoTemplate;

    public RecipeListResponse listRecipes(String tag, String name, int limit, int offset) {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");

        Query query = new Query();
        if (tag != null && !tag.isBlank()) {
            query.addCriteria(Criteria.where("tags").is(tag));
        }
        if (name != null && !name.isBlank()) {
            query.addCriteria(Criteria.where("nameNormalized").regex(name, "i"));
        }

        long total = mongoTemplate.count(query, Recipe.class);

        query.with(sort).skip(offset).limit(limit);
        List<Recipe> items = mongoTemplate.find(query, Recipe.class);

        return RecipeListResponse.builder()
                .items(items.stream().map(RecipeResponse::fromEntity).toList())
                .total(total)
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
