package com.mealplanner.service;

import com.mealplanner.dto.*;
import com.mealplanner.exception.ResourceNotFoundException;
import com.mealplanner.model.PantryLot;
import com.mealplanner.model.PantryLotType;
import com.mealplanner.repository.PantryLotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PantryLotService {

    private final PantryLotRepository pantryLotRepository;

    public PantryLotListResponse listPantryLots(PantryLotType type, String name, int limit, int offset) {
        Pageable pageable = PageRequest.of(offset / limit, limit, Sort.by(Sort.Direction.DESC, "updatedAt"));

        Page<PantryLot> page;
        if (type != null && name != null && !name.isBlank()) {
            page = pantryLotRepository.findByTypeAndNameContaining(type, name, pageable);
        } else if (type != null) {
            page = pantryLotRepository.findByType(type, pageable);
        } else if (name != null && !name.isBlank()) {
            page = pantryLotRepository.findByNameContaining(name, pageable);
        } else {
            page = pantryLotRepository.findAll(pageable);
        }

        return PantryLotListResponse.builder()
                .items(page.getContent().stream().map(PantryLotResponse::fromEntity).toList())
                .total(page.getTotalElements())
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
