package com.inventory.management.repository;

import com.inventory.management.model.Product;
import com.inventory.management.model.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySku(String sku);
    Boolean existsBySku(String sku);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findBySubcategoryId(Long subcategoryId);
    List<Product> findBySupplierId(Long supplierId);
    List<Product> findByStatus(StockStatus status);

    @Query("SELECT p FROM Product p WHERE " +
           "(:query IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:subcategoryId IS NULL OR p.subcategory.id = :subcategoryId) AND " +
           "(:status IS NULL OR p.status = :status)")
    List<Product> searchProducts(@Param("query") String query,
                                 @Param("categoryId") Long categoryId,
                                 @Param("subcategoryId") Long subcategoryId,
                                 @Param("status") StockStatus status);

    long countByStatus(StockStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Product p SET p.category = null, p.subcategory = null WHERE p.category.id = :categoryId")
    void clearCategoryReferences(@Param("categoryId") Long categoryId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Product p SET p.subcategory = null WHERE p.subcategory.id = :subcategoryId")
    void clearSubcategoryReferences(@Param("subcategoryId") Long subcategoryId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Product p SET p.supplier = null WHERE p.supplier.id = :supplierId")
    void clearSupplierReferences(@Param("supplierId") Long supplierId);
}
