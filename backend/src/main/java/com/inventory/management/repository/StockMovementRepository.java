package com.inventory.management.repository;

import com.inventory.management.model.StockMovement;
import com.inventory.management.model.StockMovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<StockMovement> findAllByOrderByCreatedAtDesc();
    List<StockMovement> findByMovementType(StockMovementType movementType);
    long countByMovementType(StockMovementType movementType);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM StockMovement sm WHERE sm.product.id = :productId")
    void deleteByProductId(@org.springframework.data.repository.query.Param("productId") Long productId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE StockMovement sm SET sm.performedBy = null WHERE sm.performedBy.id = :userId")
    void clearUserReferences(@org.springframework.data.repository.query.Param("userId") Long userId);
}
