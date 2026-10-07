package com.inventory.management.repository;

import com.inventory.management.model.ProductReturn;
import com.inventory.management.model.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRepository extends JpaRepository<ProductReturn, Long> {
    List<ProductReturn> findByRequestedByIdOrderByRequestedDateDesc(Long userId);
    List<ProductReturn> findAllByOrderByRequestedDateDesc();
    List<ProductReturn> findByStatus(ReturnStatus status);
    long countByStatus(ReturnStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE ProductReturn pr SET pr.processedBy = null WHERE pr.processedBy.id = :userId")
    void clearProcessedByReferences(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM ProductReturn pr WHERE pr.requestedBy.id = :userId")
    void deleteByRequestedById(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM ProductReturn pr WHERE pr.order.id = :orderId")
    void deleteByOrderId(@org.springframework.data.repository.query.Param("orderId") Long orderId);
}
