package com.inventory.management.service;

import com.inventory.management.dto.*;
import com.inventory.management.model.*;
import com.inventory.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private ReturnRepository returnRepository;

    @Transactional(readOnly = true)
    public InventoryReportDto getInventoryReport() {
        List<Product> products = productRepository.findAll();
        List<Category> categories = categoryRepository.findAll();
        List<Supplier> suppliers = supplierRepository.findAll();

        InventoryReportDto report = new InventoryReportDto();
        report.setTotalProducts(products.size());
        report.setTotalCategories(categories.size());
        report.setTotalSuppliers(suppliers.size());

        long totalQty = 0;
        BigDecimal totalValue = BigDecimal.ZERO;
        long healthy = 0, lowStock = 0, critical = 0, outOfStock = 0, expiringSoon = 0, expired = 0;
        Map<String, Long> categoryStockMap = new HashMap<>();

        for (Product p : products) {
            totalQty += p.getQuantity();
            if (p.getSellingPrice() != null) {
                totalValue = totalValue.add(p.getSellingPrice().multiply(BigDecimal.valueOf(p.getQuantity())));
            }

            switch (p.getStatus()) {
                case HEALTHY -> healthy++;
                case LOW_STOCK -> lowStock++;
                case CRITICAL -> critical++;
                case OUT_OF_STOCK -> outOfStock++;
                case EXPIRING_SOON -> expiringSoon++;
                case EXPIRED -> expired++;
            }

            String catName = p.getCategory() != null ? p.getCategory().getName() : "Uncategorized";
            categoryStockMap.put(catName, categoryStockMap.getOrDefault(catName, 0L) + p.getQuantity());
        }

        report.setTotalStockQuantity(totalQty);
        report.setTotalInventoryValue(totalValue);
        report.setHealthyCount(healthy);
        report.setLowStockCount(lowStock);
        report.setCriticalCount(critical);
        report.setOutOfStockCount(outOfStock);
        report.setExpiringSoonCount(expiringSoon);
        report.setExpiredCount(expired);
        report.setStockByCategory(categoryStockMap);

        return report;
    }

    @Transactional(readOnly = true)
    public SalesReportDto getSalesReport() {
        List<Order> salesOrders = orderRepository.findByOrderType(OrderType.SALE_ORDER);

        SalesReportDto report = new SalesReportDto();
        report.setTotalSalesOrders(salesOrders.size());

        long delivered = 0, pending = 0, cancelled = 0, returned = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Order o : salesOrders) {
            switch (o.getStatus()) {
                case DELIVERED, SHIPPED, PROCESSING, PACKED, CONFIRMED -> {
                    if (o.getStatus() == OrderStatus.DELIVERED) delivered++;
                    totalRevenue = totalRevenue.add(o.getTotalAmount());
                }
                case PENDING -> pending++;
                case CANCELLED -> cancelled++;
                case RETURNED -> returned++;
            }
        }

        report.setDeliveredOrders(delivered);
        report.setPendingOrders(pending);
        report.setCancelledOrders(cancelled);
        report.setReturnedOrders(returned);
        report.setTotalRevenue(totalRevenue);

        List<OrderSummaryDto> recent = salesOrders.stream()
                .limit(10)
                .map(o -> new OrderSummaryDto(
                        o.getId(),
                        o.getOrderNumber(),
                        o.getViewer() != null ? o.getViewer().getFullName() : "Guest",
                        o.getTotalAmount(),
                        o.getStatus(),
                        o.getCreatedAt()
                ))
                .collect(Collectors.toList());

        report.setRecentSales(recent);
        return report;
    }

    @Transactional(readOnly = true)
    public PurchaseReportDto getPurchaseReport() {
        List<Order> purchaseOrders = orderRepository.findByOrderType(OrderType.PURCHASE_ORDER);
        List<Supplier> activeSuppliers = supplierRepository.findByStatus(UserStatus.ACTIVE);

        PurchaseReportDto report = new PurchaseReportDto();
        report.setTotalPurchaseOrders(purchaseOrders.size());
        report.setActiveSuppliersCount(activeSuppliers.size());

        BigDecimal totalExpenditure = BigDecimal.ZERO;
        for (Order o : purchaseOrders) {
            if (o.getStatus() != OrderStatus.CANCELLED) {
                totalExpenditure = totalExpenditure.add(o.getTotalAmount());
            }
        }
        report.setTotalExpenditure(totalExpenditure);

        List<OrderSummaryDto> recent = purchaseOrders.stream()
                .limit(10)
                .map(o -> new OrderSummaryDto(
                        o.getId(),
                        o.getOrderNumber(),
                        o.getSupplier() != null ? o.getSupplier().getName() : "Direct",
                        o.getTotalAmount(),
                        o.getStatus(),
                        o.getCreatedAt()
                ))
                .collect(Collectors.toList());

        report.setRecentPurchases(recent);
        return report;
    }

    @Transactional(readOnly = true)
    public StockMovementReportDto getStockMovementReport() {
        List<StockMovement> movements = stockMovementRepository.findAllByOrderByCreatedAtDesc();

        StockMovementReportDto report = new StockMovementReportDto();
        report.setTotalMovements(movements.size());

        long stockIn = 0, stockOut = 0, adjustment = 0, sales = 0, purchases = 0, returns = 0;
        Map<String, Long> byType = new HashMap<>();

        for (StockMovement sm : movements) {
            byType.put(sm.getMovementType().name(), byType.getOrDefault(sm.getMovementType().name(), 0L) + 1);
            switch (sm.getMovementType()) {
                case STOCK_IN -> stockIn++;
                case STOCK_OUT -> stockOut++;
                case ADJUSTMENT -> adjustment++;
                case SALE -> sales++;
                case PURCHASE -> purchases++;
                case RETURN -> returns++;
            }
        }

        report.setStockInCount(stockIn);
        report.setStockOutCount(stockOut);
        report.setAdjustmentsCount(adjustment);
        report.setSalesCount(sales);
        report.setPurchasesCount(purchases);
        report.setReturnsCount(returns);
        report.setMovementsByType(byType);
        report.setRecentMovements(movements.stream().limit(15).collect(Collectors.toList()));

        return report;
    }
}
