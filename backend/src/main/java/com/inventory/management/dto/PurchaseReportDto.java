package com.inventory.management.dto;

import java.math.BigDecimal;
import java.util.List;

public class PurchaseReportDto {

    private long totalPurchaseOrders;
    private BigDecimal totalExpenditure;
    private long activeSuppliersCount;
    private List<OrderSummaryDto> recentPurchases;

    public PurchaseReportDto() {
    }

    public long getTotalPurchaseOrders() {
        return totalPurchaseOrders;
    }

    public void setTotalPurchaseOrders(long totalPurchaseOrders) {
        this.totalPurchaseOrders = totalPurchaseOrders;
    }

    public BigDecimal getTotalExpenditure() {
        return totalExpenditure;
    }

    public void setTotalExpenditure(BigDecimal totalExpenditure) {
        this.totalExpenditure = totalExpenditure;
    }

    public long getActiveSuppliersCount() {
        return activeSuppliersCount;
    }

    public void setActiveSuppliersCount(long activeSuppliersCount) {
        this.activeSuppliersCount = activeSuppliersCount;
    }

    public List<OrderSummaryDto> getRecentPurchases() {
        return recentPurchases;
    }

    public void setRecentPurchases(List<OrderSummaryDto> recentPurchases) {
        this.recentPurchases = recentPurchases;
    }
}
