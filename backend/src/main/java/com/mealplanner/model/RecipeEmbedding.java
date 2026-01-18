package com.mealplanner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeEmbedding {

    private String qdrantCollection;

    private String vectorId;

    private Instant embeddedAt;
}
