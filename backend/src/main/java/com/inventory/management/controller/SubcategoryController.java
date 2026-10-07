package com.inventory.management.controller;

import com.inventory.management.dto.ApiResponse;
import com.inventory.management.dto.SubcategoryRequest;
import com.inventory.management.model.Subcategory;
import com.inventory.management.service.SubcategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
public class SubcategoryController {

    @Autowired
    private SubcategoryService subcategoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Subcategory>>> getAllSubcategories(
            @RequestParam(required = false) Long categoryId) {
        List<Subcategory> subcategories = (categoryId != null)
                ? subcategoryService.getSubcategoriesByCategory(categoryId)
                : subcategoryService.getAllSubcategories();
        return ResponseEntity.ok(ApiResponse.success(subcategories));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<Subcategory>> getSubcategoryById(@PathVariable Long id) {
        Subcategory subcategory = subcategoryService.getSubcategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(subcategory));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Subcategory>> createSubcategory(@Valid @RequestBody SubcategoryRequest request) {
        Subcategory subcategory = subcategoryService.createSubcategory(request);
        return new ResponseEntity<>(ApiResponse.success("Subcategory created successfully", subcategory), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Subcategory>> updateSubcategory(
            @PathVariable Long id,
            @Valid @RequestBody SubcategoryRequest request) {
        Subcategory subcategory = subcategoryService.updateSubcategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subcategory updated successfully", subcategory));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubcategory(@PathVariable Long id) {
        subcategoryService.deleteSubcategory(id);
        return ResponseEntity.ok(ApiResponse.success("Subcategory deleted successfully", null));
    }
}
