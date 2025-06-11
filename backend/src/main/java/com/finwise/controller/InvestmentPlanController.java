package com.finwise.controller;

import com.finwise.dto.InvestmentPlanDTO;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.service.InvestmentPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investment-plans")
@RequiredArgsConstructor

public class InvestmentPlanController {

    private final InvestmentPlanService investmentPlanService;

    @PostMapping("/{familyProfileId}")
    public ResponseEntity<InvestmentPlanDTO> createPlan(
            @PathVariable Long familyProfileId,
            @Valid @RequestBody InvestmentPlanDTO dto) {
        InvestmentPlanDTO createdPlan = investmentPlanService.createPlan(familyProfileId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestmentPlanDTO> getPlan(@PathVariable Long id) throws ResourceNotFoundException {
        InvestmentPlanDTO plan = investmentPlanService.getPlan(id);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/family/{familyProfileId}")
    public ResponseEntity<List<InvestmentPlanDTO>> getAllPlansByFamily(@PathVariable Long familyProfileId) {
        List<InvestmentPlanDTO> plans = investmentPlanService.getAllPlansByFamily(familyProfileId);
        return ResponseEntity.ok(plans);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestmentPlanDTO> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody InvestmentPlanDTO dto) throws ResourceNotFoundException {
        InvestmentPlanDTO updatedPlan = investmentPlanService.updatePlan(id, dto);
        return ResponseEntity.ok(updatedPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) throws ResourceNotFoundException {
        investmentPlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
