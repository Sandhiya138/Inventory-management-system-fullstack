package com.inventory.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", uniqueConstraints = {
    @UniqueConstraint(columnNames = "sku")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = true)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subcategory_id")
    private Subcategory subcategory;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer quantity = 0;

    @NotNull
    @Min(0)
    @Column(name = "minimum_stock", nullable = false)
    private Integer minimumStock = 5;

    @NotNull
    @Min(1)
    @Column(name = "maximum_stock", nullable = false)
    private Integer maximumStock = 100;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "purchase_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private StockStatus status = StockStatus.HEALTHY;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Product() {
    }

    public Product(String productName, String sku, String description, Category category,
                   Subcategory subcategory, Integer quantity, Integer minimumStock,
                   Integer maximumStock, BigDecimal purchasePrice, BigDecimal sellingPrice,
                   Supplier supplier, LocalDate expiryDate) {
        this.productName = productName;
        this.sku = sku;
        this.description = description;
        this.category = category;
        this.subcategory = subcategory;
        this.quantity = quantity != null ? quantity : 0;
        this.minimumStock = minimumStock != null ? minimumStock : 5;
        this.maximumStock = maximumStock != null ? maximumStock : 100;
        this.purchasePrice = purchasePrice;
        this.sellingPrice = sellingPrice;
        this.supplier = supplier;
        this.expiryDate = expiryDate;
        this.updateCalculatedStatus();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        updateCalculatedStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateCalculatedStatus();
    }

    public void updateCalculatedStatus() {
        LocalDate today = LocalDate.now();
        if (this.expiryDate != null && this.expiryDate.isBefore(today)) {
            this.status = StockStatus.EXPIRED;
        } else if (this.expiryDate != null && this.expiryDate.isBefore(today.plusDays(30))) {
            this.status = StockStatus.EXPIRING_SOON;
        } else if (this.quantity == null || this.quantity <= 0) {
            this.status = StockStatus.OUT_OF_STOCK;
        } else if (this.minimumStock != null && this.quantity <= Math.max(1, this.minimumStock / 2)) {
            this.status = StockStatus.CRITICAL;
        } else if (this.minimumStock != null && this.quantity <= this.minimumStock) {
            this.status = StockStatus.LOW_STOCK;
        } else {
            this.status = StockStatus.HEALTHY;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Subcategory getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(Subcategory subcategory) {
        this.subcategory = subcategory;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        updateCalculatedStatus();
    }

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public void setMinimumStock(Integer minimumStock) {
        this.minimumStock = minimumStock;
        updateCalculatedStatus();
    }

    public Integer getMaximumStock() {
        return maximumStock;
    }

    public void setMaximumStock(Integer maximumStock) {
        this.maximumStock = maximumStock;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(BigDecimal sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
        updateCalculatedStatus();
    }

    public StockStatus getStatus() {
        return status;
    }

    public void setStatus(StockStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
