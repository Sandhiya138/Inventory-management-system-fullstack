package com.inventory.management.service;

import com.inventory.management.dto.ProcessReturnRequest;
import com.inventory.management.dto.ReturnRequest;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.exception.UnauthorizedException;
import com.inventory.management.model.*;
import com.inventory.management.repository.OrderRepository;
import com.inventory.management.repository.ReturnRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReturnService {

    @Autowired
    private ReturnRepository returnRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StockMovementService stockMovementService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<ProductReturn> getAllReturns() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.VIEWER) {
            return returnRepository.findByRequestedByIdOrderByRequestedDateDesc(currentUser.getId());
        }
        return returnRepository.findAllByOrderByRequestedDateDesc();
    }

    @Transactional(readOnly = true)
    public ProductReturn getReturnById(Long id) {
        ProductReturn productReturn = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return", "id", id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.VIEWER && !productReturn.getRequestedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this return request");
        }

        return productReturn;
    }

    @Transactional
    public ProductReturn createReturnRequest(ReturnRequest request) {
        User currentUser = authService.getCurrentUser();

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        if (currentUser.getRole() == Role.VIEWER && (order.getViewer() == null || !order.getViewer().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You can only request returns for your own orders");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot return a cancelled order");
        }

        ProductReturn productReturn = new ProductReturn(order, currentUser, request.getReason());
        ProductReturn savedReturn = returnRepository.save(productReturn);

        // Notify Staff and Admin
        notificationService.createNotification(
                null,
                Role.STAFF,
                NotificationType.RETURN_REQUEST,
                "Return Request: Order " + order.getOrderNumber(),
                "Customer " + currentUser.getFullName() + " requested a return for order #" + order.getOrderNumber() + ". Reason: " + request.getReason(),
                savedReturn.getId()
        );

        return savedReturn;
    }

    @Transactional
    public ProductReturn processReturn(Long id, ProcessReturnRequest request) {
        ProductReturn productReturn = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return", "id", id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.VIEWER) {
            throw new UnauthorizedException("Viewers cannot process return requests");
        }

        ReturnStatus oldStatus = productReturn.getStatus();
        ReturnStatus newStatus = request.getStatus();

        productReturn.setStatus(newStatus);
        productReturn.setStaffNotes(request.getStaffNotes());
        productReturn.setProcessedBy(currentUser);
        productReturn.setProcessedDate(LocalDateTime.now());

        // If approved or completed, restock items and update order status
        if ((newStatus == ReturnStatus.APPROVED || newStatus == ReturnStatus.COMPLETED) && oldStatus == ReturnStatus.REQUESTED) {
            Order order = productReturn.getOrder();
            order.setStatus(OrderStatus.RETURNED);
            orderRepository.save(order);

            for (OrderItem item : order.getOrderItems()) {
                stockMovementService.recordInternalMovement(
                        item.getProduct(),
                        StockMovementType.RETURN,
                        item.getQuantity(),
                        order.getOrderNumber(),
                        "Stock restored from approved return #" + productReturn.getId(),
                        currentUser
                );
            }
        }

        ProductReturn updatedReturn = returnRepository.save(productReturn);

        // Notify customer
        notificationService.createNotification(
                productReturn.getRequestedBy(),
                null,
                NotificationType.RETURN_REQUEST,
                "Return Request Update",
                "Your return request for order " + productReturn.getOrder().getOrderNumber() + " has been " + newStatus,
                updatedReturn.getId()
        );

        return updatedReturn;
    }
}
