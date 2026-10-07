package com.inventory.management.dto;

import com.inventory.management.model.StockMovement;

import java.util.List;
import java.util.Map;

public class StockMovementReportDto {

    private long totalMovements;
    private long stockInCount;
    private long stockOutCount;
    private long adjustmentsCount;
    private long salesCount;
    private long purchasesCount;
    private long returnsCount;
    private Map<String, Long> movementsByType;
    private List<StockMovement> recentMovements;

    public StockMovementReportDto() {
    }

    public long getTotalMovements() {
        return totalMovements;
    }

    public void setTotalMovements(long totalMovements) {
        this.totalMovements = totalMovements;
    }

    public long getStockInCount() {
        return stockInCount;
    }

    public void setStockInCount(long stockInCount) {
        this.stockInCount = stockInCount;
    }

    public long getStockOutCount() {
        return stockOutCount;
    }

    public void setStockOutCount(long stockOutCount) {
        this.stockOutCount = stockOutCount;
    }

    public long getAdjustmentsCount() {
        return adjustmentsCount;
    }

    public void setAdjustmentsCount(long adjustmentsCount) {
        this.adjustmentsCount = adjustmentsCount;
    }

    public long getSalesCount() {
        return salesCount;
    }

    public void setSalesCount(long salesCount) {
        this.salesCount = salesCount;
    }

    public long getPurchasesCount() {
        return purchasesCount;
    }

    public void setPurchasesCount(long purchasesCount) {
        this.purchasesCount = purchasesCount;
    }

    public long getReturnsCount() {
        return returnsCount;
    }

    public void setReturnsCount(long returnsCount) {
        this.returnsCount = returnsCount;
    }

    public Map<String, Long> getMovementsByType() {
        return movementsByType;
    }

    public void setMovementsByType(Map<String, Long> movementsByType) {
        this.movementsByType = movementsByType;
    }

    public List<StockMovement> getRecentMovements() {
        return recentMovements;
    }

    public void setRecentMovements(List<StockMovement> recentMovements) {
        this.recentMovements = recentMovements;
    }
}
