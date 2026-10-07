package com.inventory.management.repository;

import com.inventory.management.model.Order;
import com.inventory.management.model.OrderStatus;
import com.inventory.management.model.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByViewerIdOrderByCreatedAtDesc(Long viewerId);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByOrderType(OrderType orderType);
    long countByStatus(OrderStatus status);
    long countByOrderType(OrderType orderType);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Order o SET o.supplier = null WHERE o.supplier.id = :supplierId")
    void clearSupplierReferences(@org.springframework.data.repository.query.Param("supplierId") Long supplierId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Order o SET o.assignedStaff = null WHERE o.assignedStaff.id = :userId")
    void clearAssignedStaffReferences(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Order o SET o.viewer = null WHERE o.viewer.id = :userId")
    void clearViewerReferences(@org.springframework.data.repository.query.Param("userId") Long userId);
}
