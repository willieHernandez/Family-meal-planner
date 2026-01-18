package com.mealplanner.runner;

import com.mealplanner.service.RecipeSeederService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecipeSeederRunner implements ApplicationRunner {

    private final RecipeSeederService recipeSeederService;

    @Value("${mealplanner.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!seedEnabled) {
            log.info("Recipe seeding is disabled. Set mealplanner.seed.enabled=true to enable.");
            return;
        }

        log.info("Recipe seeding is enabled. Starting seeder...");
        RecipeSeederService.SeederResult result = recipeSeederService.seedRecipes();
        log.info("Recipe seeding completed: {}", result.message());
    }
}
