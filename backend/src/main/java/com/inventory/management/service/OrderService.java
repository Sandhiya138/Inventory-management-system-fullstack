package com.inventory.management.service;

import com.inventory.management.dto.OrderItemRequest;
import com.inventory.management.dto.OrderRequest;
import com.inventory.management.dto.OrderStatusUpdateRequest;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.exception.UnauthorizedException;
import com.inventory.management.model.*;
import com.inventory.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private StockMovementService stockMovementService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ReturnRepository returnRepository;

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.VIEWER) {
            return orderRepository.findByViewerIdOrderByCreatedAtDesc(currentUser.getId());
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == Role.VIEWER && (order.getViewer() == null || !order.getViewer().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You are not authorized to view this order");
        }

        return order;
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        User currentUser = authService.getCurrentUser();

        String orderNumber = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setShippingAddress(request.getShippingAddress());
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.PENDING);

        if (currentUser.getRole() == Role.VIEWER) {
            order.setOrderType(OrderType.SALE_ORDER);
            order.setViewer(currentUser);
        } else {
            order.setOrderType(request.getOrderType() != null ? request.getOrderType() : OrderType.SALE_ORDER);
            if (order.getOrderType() == OrderType.SALE_ORDER) {
                order.setViewer(currentUser);
            } else if (order.getOrderType() == OrderType.PURCHASE_ORDER && request.getSupplierId() != null) {
                Supplier supplier = supplierRepository.findById(request.getSupplierId())
                        .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
                order.setSupplier(supplier);
            }
        }

        // Auto-assign available active warehouse staff for fulfillment
        User assignedStaff = null;
        if (order.getOrderType() == OrderType.SALE_ORDER) {
            List<User> activeStaff = userRepository.findByRoleAndStatus(Role.STAFF, UserStatus.ACTIVE);
            if (!activeStaff.isEmpty()) {
                assignedStaff = activeStaff.get(new java.util.Random().nextInt(activeStaff.size()));
                order.setAssignedStaff(assignedStaff);
            }
        }

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            BigDecimal unitPrice = itemReq.getUnitPrice();
            if (unitPrice == null) {
                unitPrice = (order.getOrderType() == OrderType.PURCHASE_ORDER)
                        ? product.getPurchasePrice()
                        : product.getSellingPrice();
            }

            if (order.getOrderType() == OrderType.SALE_ORDER) {
                if (product.getQuantity() < itemReq.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for product '" + product.getProductName() + "'. Available: " + product.getQuantity() + ", requested: " + itemReq.getQuantity());
                }
            }

            OrderItem orderItem = new OrderItem(product, itemReq.getQuantity(), unitPrice);
            order.addOrderItem(orderItem);
            calculatedTotal = calculatedTotal.add(orderItem.getTotalPrice());
        }

        order.setTotalAmount(calculatedTotal);
        Order savedOrder = orderRepository.save(order);

        // Deduct stock for Sale Orders or increase stock for Purchase Orders
        for (OrderItem item : savedOrder.getOrderItems()) {
            if (savedOrder.getOrderType() == OrderType.SALE_ORDER) {
                stockMovementService.recordInternalMovement(
                        item.getProduct(),
                        StockMovementType.SALE,
                        item.getQuantity(),
                        savedOrder.getOrderNumber(),
                        "Sale order placement: " + savedOrder.getOrderNumber(),
                        currentUser
                );
            } else if (savedOrder.getOrderType() == OrderType.PURCHASE_ORDER) {
                stockMovementService.recordInternalMovement(
                        item.getProduct(),
                        StockMovementType.PURCHASE,
                        item.getQuantity(),
                        savedOrder.getOrderNumber(),
                        "Purchase order placement: " + savedOrder.getOrderNumber(),
                        currentUser
                );
            }
        }

        // Notify Assigned Staff directly if assigned
        if (assignedStaff != null) {
            notificationService.createNotification(
                    assignedStaff,
                    Role.STAFF,
                    NotificationType.NEW_ORDER,
                    "Order Assigned to You: " + savedOrder.getOrderNumber(),
                    "Order #" + savedOrder.getOrderNumber() + " (Total: ₹" + savedOrder.getTotalAmount() + ") has been assigned to you for fulfillment.",
                    savedOrder.getId()
            );
        }

        // Notify Staff and Admin about new order
        notificationService.createNotification(
                null,
                Role.ADMIN,
                NotificationType.NEW_ORDER,
                "New Order Received: " + savedOrder.getOrderNumber(),
                "A new " + savedOrder.getOrderType() + " has been placed for total ₹" + savedOrder.getTotalAmount() + (assignedStaff != null ? " (Assigned to: " + assignedStaff.getFullName() + ")" : ""),
                savedOrder.getId()
        );

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        User currentUser = authService.getCurrentUser();
        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (oldStatus == newStatus) {
            return order;
        }

        if (currentUser.getRole() == Role.VIEWER) {
            // Viewers can only cancel their own PENDING orders
            if (order.getViewer() == null || !order.getViewer().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to update this order");
            }
            if (newStatus != OrderStatus.CANCELLED) {
                throw new BadRequestException("Viewers can only request order cancellation");
            }
            if (oldStatus != OrderStatus.PENDING) {
                throw new BadRequestException("Only pending orders can be cancelled by the viewer");
            }
        }

        order.setStatus(newStatus);
        if (request.getNotes() != null) {
            order.setNotes(order.getNotes() != null ? order.getNotes() + " | " + request.getNotes() : request.getNotes());
        }

        // If order was cancelled and was a SALE_ORDER, restore the stock!
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            if (order.getOrderType() == OrderType.SALE_ORDER) {
                for (OrderItem item : order.getOrderItems()) {
                    stockMovementService.recordInternalMovement(
                            item.getProduct(),
                            StockMovementType.RETURN,
                            item.getQuantity(),
                            order.getOrderNumber(),
                            "Stock restored due to order cancellation: " + order.getOrderNumber(),
                            currentUser
                    );
                }
            }
        }

        Order updatedOrder = orderRepository.save(order);

        // Notify customer / viewer of status change
        if (order.getViewer() != null) {
            notificationService.createNotification(
                    order.getViewer(),
                    null,
                    NotificationType.ORDER_STATUS_CHANGED,
                    "Order Status Update: " + order.getOrderNumber(),
                    "Your order #" + order.getOrderNumber() + " status is now: " + newStatus,
                    order.getId()
            );
        }

        // If staff processed the update, notify Admin
        if (currentUser.getRole() == Role.STAFF) {
            notificationService.createNotification(
                    null,
                    Role.ADMIN,
                    NotificationType.ORDER_STATUS_CHANGED,
                    "Staff Order Update: " + order.getOrderNumber(),
                    "Order #" + order.getOrderNumber() + " status updated to " + newStatus + " by " + currentUser.getFullName(),
                    order.getId()
            );
        }

        return updatedOrder;
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        conversationRepository.clearRelatedOrderReferences(id);
        returnRepository.deleteByOrderId(id);
        orderRepository.delete(order);
    }
}
