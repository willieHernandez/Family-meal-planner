package com.mealplanner.repository;

import com.mealplanner.model.PantryLot;
import com.mealplanner.model.PantryLotType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PantryLotRepository extends MongoRepository<PantryLot, String> {

    Page<PantryLot> findByType(PantryLotType type, Pageable pageable);

    @Query("{ 'nameNormalized': { $regex: ?0, $options: 'i' } }")
    Page<PantryLot> findByNameContaining(String name, Pageable pageable);

    @Query("{ 'type': ?0, 'nameNormalized': { $regex: ?1, $options: 'i' } }")
    Page<PantryLot> findByTypeAndNameContaining(PantryLotType type, String name, Pageable pageable);

    List<PantryLot> findByNameNormalizedIgnoreCase(String nameNormalized);
}
