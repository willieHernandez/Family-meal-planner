package com.mealplanner.service;

import com.mealplanner.dto.*;
import com.mealplanner.exception.ResourceNotFoundException;
import com.mealplanner.model.PantryLot;
import com.mealplanner.model.PantryLotType;
import com.mealplanner.repository.PantryLotRepository;
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
public class PantryLotService {

    private final PantryLotRepository pantryLotRepository;
    private final MongoTemplate mongoTemplate;

    public PantryLotListResponse listPantryLots(PantryLotType type, String name, int limit, int offset) {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");

        Query query = new Query();
        if (type != null) {
            query.addCriteria(Criteria.where("type").is(type));
        }
        if (name != null && !name.isBlank()) {
            query.addCriteria(Criteria.where("nameNormalized").regex(name, "i"));
        }

        long total = mongoTemplate.count(query, PantryLot.class);

        query.with(sort).skip(offset).limit(limit);
        List<PantryLot> items = mongoTemplate.find(query, PantryLot.class);

        return PantryLotListResponse.builder()
                .items(items.stream().map(PantryLotResponse::fromEntity).toList())
                .total(total)
                .build();
    }

    public PantryLotResponse getPantryLot(String id) {
        PantryLot pantryLot = pantryLotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PantryLot", id));
        return PantryLotResponse.fromEntity(pantryLot);
    }

    public PantryLotResponse createPantryLot(PantryLotCreateRequest request) {
        PantryLot pantryLot = PantryLot.builder()
                .name(request.getName())
                .nameNormalized(normalizeName(request.getName()))
                .type(request.getType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .metadata(request.getMetadata())
                .build();

        PantryLot saved = pantryLotRepository.save(pantryLot);
        return PantryLotResponse.fromEntity(saved);
    }

    public PantryLotResponse updatePantryLot(String id, PantryLotUpdateRequest request) {
        PantryLot pantryLot = pantryLotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PantryLot", id));

        pantryLot.setName(request.getName());
        pantryLot.setNameNormalized(normalizeName(request.getName()));
        pantryLot.setType(request.getType());
        pantryLot.setQuantity(request.getQuantity());
        pantryLot.setUnit(request.getUnit());
        pantryLot.setMetadata(request.getMetadata());

        PantryLot saved = pantryLotRepository.save(pantryLot);
        return PantryLotResponse.fromEntity(saved);
    }

    public void deletePantryLot(String id) {
        if (!pantryLotRepository.existsById(id)) {
            throw new ResourceNotFoundException("PantryLot", id);
        }
        pantryLotRepository.deleteById(id);
    }

    private String normalizeName(String name) {
        return name != null ? name.toLowerCase(Locale.ROOT).trim() : null;
    }
}
