package com.inventory.management.dto;

import java.math.BigDecimal;
import java.util.Map;

public class InventoryReportDto {

    private long totalProducts;
    private long totalCategories;
    private long totalSuppliers;
    private long totalStockQuantity;
    private BigDecimal totalInventoryValue;
    private long healthyCount;
    private long lowStockCount;
    private long criticalCount;
    private long outOfStockCount;
    private long expiringSoonCount;
    private long expiredCount;
    private Map<String, Long> stockByCategory;

    public InventoryReportDto() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getTotalSuppliers() {
        return totalSuppliers;
    }

    public void setTotalSuppliers(long totalSuppliers) {
        this.totalSuppliers = totalSuppliers;
    }

    public long getTotalStockQuantity() {
        return totalStockQuantity;
    }

    public void setTotalStockQuantity(long totalStockQuantity) {
        this.totalStockQuantity = totalStockQuantity;
    }

    public BigDecimal getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(BigDecimal totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }

    public long getHealthyCount() {
        return healthyCount;
    }

    public void setHealthyCount(long healthyCount) {
        this.healthyCount = healthyCount;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getCriticalCount() {
        return criticalCount;
    }

    public void setCriticalCount(long criticalCount) {
        this.criticalCount = criticalCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public long getExpiringSoonCount() {
        return expiringSoonCount;
    }

    public void setExpiringSoonCount(long expiringSoonCount) {
        this.expiringSoonCount = expiringSoonCount;
    }

    public long getExpiredCount() {
        return expiredCount;
    }

    public void setExpiredCount(long expiredCount) {
        this.expiredCount = expiredCount;
    }

    public Map<String, Long> getStockByCategory() {
        return stockByCategory;
    }

    public void setStockByCategory(Map<String, Long> stockByCategory) {
        this.stockByCategory = stockByCategory;
    }
}
