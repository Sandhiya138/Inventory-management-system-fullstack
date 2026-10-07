package com.inventory.management.repository;

import com.inventory.management.model.Supplier;
import com.inventory.management.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByName(String name);
    List<Supplier> findByStatus(UserStatus status);
}
