package com.inventory.management.controller;

import com.inventory.management.dto.ApiResponse;
import com.inventory.management.dto.ProcessReturnRequest;
import com.inventory.management.dto.ReturnRequest;
import com.inventory.management.model.ProductReturn;
import com.inventory.management.service.ReturnService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    @Autowired
    private ReturnService returnService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<ProductReturn>>> getAllReturns() {
        List<ProductReturn> returns = returnService.getAllReturns();
        return ResponseEntity.ok(ApiResponse.success(returns));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<ProductReturn>> getReturnById(@PathVariable Long id) {
        ProductReturn productReturn = returnService.getReturnById(id);
        return ResponseEntity.ok(ApiResponse.success(productReturn));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<ProductReturn>> createReturnRequest(@Valid @RequestBody ReturnRequest request) {
        ProductReturn productReturn = returnService.createReturnRequest(request);
        return new ResponseEntity<>(ApiResponse.success("Return request submitted successfully", productReturn), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ProductReturn>> processReturn(
            @PathVariable Long id,
            @Valid @RequestBody ProcessReturnRequest request) {
        ProductReturn productReturn = returnService.processReturn(id, request);
        return ResponseEntity.ok(ApiResponse.success("Return request processed successfully", productReturn));
    }
}
