package com.mealplanner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pantryLots")
@CompoundIndex(name = "type_name_idx", def = "{'type': 1, 'nameNormalized': 1}")
public class PantryLot {

    @Id
    private String id;

    @Builder.Default
    private int schemaVersion = 1;

    private String name;

    @Indexed
    private String nameNormalized;

    private PantryLotType type;

    private double quantity;

    private String unit;

    private Map<String, Object> metadata;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
