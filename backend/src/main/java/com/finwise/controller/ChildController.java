package com.finwise.controller;

import com.finwise.dto.ChildDTO;
import com.finwise.dto.FamilyProfileDTO;
import com.finwise.dto.MarriagePlanDTO;
import com.finwise.entity.FamilyProfile;
import com.finwise.entity.User;
import com.finwise.service.ChildService;
import com.finwise.service.FamilyProfileService;
import com.finwise.service.MarriagePlanService;
import com.finwise.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/children")
@CrossOrigin(origins = "https://finwise-msj9.onrender.com/", allowCredentials = "true")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;
    private final Util util;
    private final FamilyProfileService familyProfileService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ChildDTO dto) {
        return ResponseEntity.ok(childService.createChild(dto));
    }

    @GetMapping
    public ResponseEntity<List<ChildDTO>> getAll() {
        return ResponseEntity.ok(childService.getAllChildren());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChildDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(childService.getChildById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChildDTO> update(@PathVariable Long id, @RequestBody ChildDTO dto) {
        return ResponseEntity.ok(childService.updateChild(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        childService.deleteChild(id);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{id}")
    public ResponseEntity<ChildDTO> patchChild(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        ChildDTO updatedDto = childService.patchChild(updates, id);
        return ResponseEntity.ok(updatedDto);
    }

}
