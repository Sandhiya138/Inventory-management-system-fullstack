package com.inventory.management.controller;

import com.inventory.management.dto.*;
import com.inventory.management.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<InventoryReportDto>> getInventoryReport() {
        InventoryReportDto report = reportService.getInventoryReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesReportDto>> getSalesReport() {
        SalesReportDto report = reportService.getSalesReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/purchases")
    public ResponseEntity<ApiResponse<PurchaseReportDto>> getPurchaseReport() {
        PurchaseReportDto report = reportService.getPurchaseReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/stock-movements")
    public ResponseEntity<ApiResponse<StockMovementReportDto>> getStockMovementReport() {
        StockMovementReportDto report = reportService.getStockMovementReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
