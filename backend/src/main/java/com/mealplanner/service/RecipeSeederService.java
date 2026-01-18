package com.mealplanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealplanner.model.Recipe;
import com.mealplanner.model.RecipeIngredient;
import com.mealplanner.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeSeederService {

    private final RecipeRepository recipeRepository;
    private final ObjectMapper objectMapper;

    private static final String SEED_FILE_PATH = "data/recipes_seed.json";

    public SeederResult seedRecipes() {
        log.info("Starting recipe seeding from {}", SEED_FILE_PATH);

        int inserted = 0;
        int skipped = 0;
        int failed = 0;

        try {
            ClassPathResource resource = new ClassPathResource(SEED_FILE_PATH);
            if (!resource.exists()) {
                log.warn("Seed file not found: {}", SEED_FILE_PATH);
                return new SeederResult(0, 0, 0, "Seed file not found");
            }

            try (InputStream is = resource.getInputStream()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = objectMapper.readValue(is, Map.class);
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> recipes = (List<Map<String, Object>>) data.get("recipes");

                if (recipes == null || recipes.isEmpty()) {
                    log.warn("No recipes found in seed file");
                    return new SeederResult(0, 0, 0, "No recipes in seed file");
                }

                log.info("Found {} recipes in seed file", recipes.size());

                for (Map<String, Object> recipeData : recipes) {
                    try {
                        String externalKey = (String) recipeData.get("externalKey");
                        String name = (String) recipeData.get("name");

                        // Check for existing recipe by externalKey (idempotency)
                        Optional<Recipe> existing = recipeRepository.findByExternalKey(externalKey);
                        if (existing.isPresent()) {
                            log.debug("Recipe already exists (externalKey={}): {}", externalKey, name);
                            skipped++;
                            continue;
                        }

                        Recipe recipe = mapToRecipe(recipeData);
                        recipeRepository.save(recipe);
                        log.info("Inserted recipe: {} (externalKey={})", name, externalKey);
                        inserted++;

                    } catch (Exception e) {
                        log.error("Failed to seed recipe: {}", recipeData.get("name"), e);
                        failed++;
                    }
                }
            }

        } catch (Exception e) {
            log.error("Failed to read seed file", e);
            return new SeederResult(inserted, skipped, failed, "Error reading seed file: " + e.getMessage());
        }

        String message = String.format("Seeding complete: %d inserted, %d skipped, %d failed",
                                       inserted, skipped, failed);
        log.info(message);
        return new SeederResult(inserted, skipped, failed, message);
    }

    @SuppressWarnings("unchecked")
    private Recipe mapToRecipe(Map<String, Object> data) {
        String name = (String) data.get("name");
        String externalKey = (String) data.get("externalKey");

        List<Map<String, Object>> ingredientsList = (List<Map<String, Object>>) data.get("ingredients");
        List<RecipeIngredient> ingredients = ingredientsList.stream()
                .map(this::mapToIngredient)
                .toList();

        List<String> instructions = (List<String>) data.get("instructions");
        int servings = ((Number) data.get("servings")).intValue();
        List<String> tags = (List<String>) data.get("tags");

        return Recipe.builder()
                .name(name)
                .nameNormalized(name.toLowerCase(Locale.ROOT).trim())
                .externalKey(externalKey)
                .ingredients(ingredients)
                .instructions(instructions)
                .servings(servings)
                .tags(tags != null ? tags : List.of())
                .build();
    }

    private RecipeIngredient mapToIngredient(Map<String, Object> data) {
        return RecipeIngredient.builder()
                .name((String) data.get("name"))
                .quantity(((Number) data.get("quantity")).doubleValue())
                .unit((String) data.get("unit"))
                .build();
    }

    public record SeederResult(int inserted, int skipped, int failed, String message) {}
}
