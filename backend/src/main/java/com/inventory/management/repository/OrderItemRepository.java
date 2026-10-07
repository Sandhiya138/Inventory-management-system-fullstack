package com.inventory.management.repository;

import com.inventory.management.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM OrderItem oi WHERE oi.product.id = :productId")
    void deleteByProductId(@org.springframework.data.repository.query.Param("productId") Long productId);
}
