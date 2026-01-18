package com.mealplanner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "recipes")
public class Recipe {

    @Id
    private String id;

    @Builder.Default
    private int schemaVersion = 1;

    private String name;

    @Indexed
    private String nameNormalized;

    private List<RecipeIngredient> ingredients;

    private List<String> instructions;

    private int servings;

    @Indexed
    private List<String> tags;

    private RecipeEmbedding embedding;

    @Indexed(sparse = true)
    private String externalKey;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
