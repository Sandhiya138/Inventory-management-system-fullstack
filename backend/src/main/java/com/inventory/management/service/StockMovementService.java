package com.inventory.management.service;

import com.inventory.management.dto.StockMovementRequest;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.*;
import com.inventory.management.repository.ProductRepository;
import com.inventory.management.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockMovementService {

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<StockMovement> getAllStockMovements() {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMovementsByProductId(Long productId) {
        return stockMovementRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Transactional
    public StockMovement recordMovement(StockMovementRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        User currentUser = null;
        try {
            currentUser = authService.getCurrentUser();
        } catch (Exception ignored) {
            // Could be system automated seed
        }

        int previousStock = product.getQuantity();
        int movementQty = request.getQuantity();
        int newStock;

        StockMovementType type = request.getMovementType();
        switch (type) {
            case STOCK_IN:
            case PURCHASE:
            case RETURN:
                newStock = previousStock + movementQty;
                break;
            case STOCK_OUT:
            case SALE:
                if (previousStock < movementQty) {
                    throw new BadRequestException("Insufficient stock for product '" + product.getProductName() + "'. Available: " + previousStock + ", requested: " + movementQty);
                }
                newStock = previousStock - movementQty;
                break;
            case ADJUSTMENT:
                // For direct adjustment request, if quantity difference or override
                newStock = previousStock + movementQty;
                if (newStock < 0) {
                    newStock = 0;
                }
                break;
            default:
                throw new BadRequestException("Unknown stock movement type: " + type);
        }

        product.setQuantity(newStock);
        productRepository.save(product);
        productService.triggerStockAlertsIfNeeded(product);

        StockMovement movement = new StockMovement(
                product,
                type,
                movementQty,
                previousStock,
                newStock,
                request.getReferenceNumber(),
                request.getReason(),
                currentUser
        );

        return stockMovementRepository.save(movement);
    }

    @Transactional
    public StockMovement recordInternalMovement(Product product, StockMovementType type, int quantity,
                                                String referenceNumber, String reason, User performedBy) {
        int previousStock = product.getQuantity();
        int newStock;

        switch (type) {
            case STOCK_IN:
            case PURCHASE:
            case RETURN:
                newStock = previousStock + quantity;
                break;
            case STOCK_OUT:
            case SALE:
                if (previousStock < quantity) {
                    throw new BadRequestException("Insufficient stock for product '" + product.getProductName() + "'. Available: " + previousStock + ", requested: " + quantity);
                }
                newStock = previousStock - quantity;
                break;
            case ADJUSTMENT:
                newStock = previousStock + quantity;
                if (newStock < 0) {
                    newStock = 0;
                }
                break;
            default:
                throw new BadRequestException("Unknown movement type: " + type);
        }

        product.setQuantity(newStock);
        productRepository.save(product);
        productService.triggerStockAlertsIfNeeded(product);

        StockMovement movement = new StockMovement(
                product,
                type,
                quantity,
                previousStock,
                newStock,
                referenceNumber,
                reason,
                performedBy
        );

        return stockMovementRepository.save(movement);
    }
}
