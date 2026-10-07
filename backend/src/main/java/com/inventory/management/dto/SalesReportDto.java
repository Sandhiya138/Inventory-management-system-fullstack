package com.inventory.management.dto;

import java.math.BigDecimal;
import java.util.List;

public class SalesReportDto {

    private long totalSalesOrders;
    private long deliveredOrders;
    private long pendingOrders;
    private long cancelledOrders;
    private long returnedOrders;
    private BigDecimal totalRevenue;
    private List<OrderSummaryDto> recentSales;

    public SalesReportDto() {
    }

    public long getTotalSalesOrders() {
        return totalSalesOrders;
    }

    public void setTotalSalesOrders(long totalSalesOrders) {
        this.totalSalesOrders = totalSalesOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }

    public long getReturnedOrders() {
        return returnedOrders;
    }

    public void setReturnedOrders(long returnedOrders) {
        this.returnedOrders = returnedOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<OrderSummaryDto> getRecentSales() {
        return recentSales;
    }

    public void setRecentSales(List<OrderSummaryDto> recentSales) {
        this.recentSales = recentSales;
    }
}
