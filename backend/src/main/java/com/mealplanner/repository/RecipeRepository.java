package com.mealplanner.repository;

import com.mealplanner.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, String> {

    @Query("{ 'nameNormalized': { $regex: ?0, $options: 'i' } }")
    Page<Recipe> findByNameContaining(String name, Pageable pageable);

    Page<Recipe> findByTagsContaining(String tag, Pageable pageable);

    @Query("{ 'tags': ?0, 'nameNormalized': { $regex: ?1, $options: 'i' } }")
    Page<Recipe> findByTagAndNameContaining(String tag, String name, Pageable pageable);

    Optional<Recipe> findByExternalKey(String externalKey);

    Optional<Recipe> findByNameNormalizedIgnoreCase(String nameNormalized);
}
