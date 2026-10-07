package com.inventory.management.service;

import com.inventory.management.dto.ProductRequest;
import com.inventory.management.dto.ProductResponse;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.*;
import com.inventory.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(String query, Long categoryId, Long subcategoryId, StockStatus status) {
        List<Product> products;
        if (query != null || categoryId != null || subcategoryId != null || status != null) {
            String searchQ = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
            products = productRepository.searchProducts(searchQ, categoryId, subcategoryId, status);
        } else {
            products = productRepository.findAll();
        }

        return products.stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return new ProductResponse(product);
    }

    @Transactional(readOnly = true)
    public Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return new ProductResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU already exists: " + request.getSku());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Subcategory subcategory = null;
        if (request.getSubcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.getSubcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", request.getSubcategoryId()));
            if (!subcategory.getCategory().getId().equals(category.getId())) {
                throw new BadRequestException("Selected subcategory does not belong to category: " + category.getName());
            }
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
        }

        Product product = new Product(
                request.getProductName(),
                request.getSku(),
                request.getDescription(),
                category,
                subcategory,
                request.getQuantity(),
                request.getMinimumStock(),
                request.getMaximumStock(),
                request.getPurchasePrice(),
                request.getSellingPrice(),
                supplier,
                request.getExpiryDate()
        );

        Product savedProduct = productRepository.save(product);
        triggerStockAlertsIfNeeded(savedProduct);

        return new ProductResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = getProductEntityById(id);

        if (!product.getSku().equalsIgnoreCase(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU already exists: " + request.getSku());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Subcategory subcategory = null;
        if (request.getSubcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.getSubcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", request.getSubcategoryId()));
            if (!subcategory.getCategory().getId().equals(category.getId())) {
                throw new BadRequestException("Selected subcategory does not belong to category: " + category.getName());
            }
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
        }

        product.setProductName(request.getProductName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setSubcategory(subcategory);
        product.setQuantity(request.getQuantity());
        product.setMinimumStock(request.getMinimumStock());
        product.setMaximumStock(request.getMaximumStock());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setSupplier(supplier);
        product.setExpiryDate(request.getExpiryDate());

        Product updatedProduct = productRepository.save(product);
        triggerStockAlertsIfNeeded(updatedProduct);

        return new ProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductEntityById(id);
        stockMovementRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    public void triggerStockAlertsIfNeeded(Product product) {
        StockStatus status = product.getStatus();
        if (status == StockStatus.OUT_OF_STOCK) {
            notificationService.createNotification(
                    null,
                    Role.STAFF,
                    NotificationType.OUT_OF_STOCK,
                    "Out of Stock Alert: " + product.getProductName(),
                    "Product '" + product.getProductName() + "' (SKU: " + product.getSku() + ") is completely out of stock!",
                    product.getId()
            );
        } else if (status == StockStatus.CRITICAL) {
            notificationService.createNotification(
                    null,
                    Role.STAFF,
                    NotificationType.CRITICAL_STOCK,
                    "Critical Stock Alert: " + product.getProductName(),
                    "Product '" + product.getProductName() + "' has critically low stock (" + product.getQuantity() + " remaining).",
                    product.getId()
            );
        } else if (status == StockStatus.LOW_STOCK) {
            notificationService.createNotification(
                    null,
                    Role.STAFF,
                    NotificationType.LOW_STOCK,
                    "Low Stock Alert: " + product.getProductName(),
                    "Product '" + product.getProductName() + "' stock is low (" + product.getQuantity() + " remaining, minimum is " + product.getMinimumStock() + ").",
                    product.getId()
            );
        } else if (status == StockStatus.EXPIRING_SOON) {
            notificationService.createNotification(
                    null,
                    Role.STAFF,
                    NotificationType.EXPIRING_PRODUCT,
                    "Product Expiring Soon: " + product.getProductName(),
                    "Product '" + product.getProductName() + "' will expire on " + product.getExpiryDate() + ".",
                    product.getId()
            );
        }
    }
}
