package com.inventory.management.controller;

import com.inventory.management.dto.ApiResponse;
import com.inventory.management.dto.StockMovementRequest;
import com.inventory.management.model.StockMovement;
import com.inventory.management.service.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    @Autowired
    private StockMovementService stockMovementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockMovement>>> getAllStockMovements(
            @RequestParam(required = false) Long productId) {
        List<StockMovement> movements = (productId != null)
                ? stockMovementService.getMovementsByProductId(productId)
                : stockMovementService.getAllStockMovements();
        return ResponseEntity.ok(ApiResponse.success(movements));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<StockMovement>> recordStockMovement(@Valid @RequestBody StockMovementRequest request) {
        StockMovement movement = stockMovementService.recordMovement(request);
        return new ResponseEntity<>(ApiResponse.success("Stock movement recorded successfully", movement), HttpStatus.CREATED);
    }
}
