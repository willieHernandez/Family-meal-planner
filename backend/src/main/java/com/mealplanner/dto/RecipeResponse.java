package com.mealplanner.dto;

import com.mealplanner.model.Recipe;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeResponse {

    private String id;
    private String name;
    private List<RecipeIngredientDto> ingredients;
    private List<String> instructions;
    private int servings;
    private List<String> tags;
    private EmbeddingInfo embedding;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmbeddingInfo {
        private String qdrantCollection;
        private String vectorId;
        private Instant embeddedAt;
    }

    public static RecipeResponse fromEntity(Recipe entity) {
        RecipeResponse.RecipeResponseBuilder builder = RecipeResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .ingredients(entity.getIngredients() != null
                        ? entity.getIngredients().stream()
                                .map(RecipeIngredientDto::fromEntity)
                                .toList()
                        : List.of())
                .instructions(entity.getInstructions() != null ? entity.getInstructions() : List.of())
                .servings(entity.getServings())
                .tags(entity.getTags() != null ? entity.getTags() : List.of())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt());

        if (entity.getEmbedding() != null) {
            builder.embedding(EmbeddingInfo.builder()
                    .qdrantCollection(entity.getEmbedding().getQdrantCollection())
                    .vectorId(entity.getEmbedding().getVectorId())
                    .embeddedAt(entity.getEmbedding().getEmbeddedAt())
                    .build());
        }

        return builder.build();
    }
}
