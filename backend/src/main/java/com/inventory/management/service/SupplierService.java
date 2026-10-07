package com.inventory.management.service;

import com.inventory.management.dto.SupplierRequest;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.Supplier;
import com.inventory.management.model.UserStatus;
import com.inventory.management.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private com.inventory.management.repository.ProductRepository productRepository;

    @Autowired
    private com.inventory.management.repository.OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
    }

    @Transactional
    public Supplier createSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier(
                request.getName(),
                request.getContactPerson(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
        );
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = getSupplierById(id);

        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }

        return supplierRepository.save(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        productRepository.clearSupplierReferences(id);
        orderRepository.clearSupplierReferences(id);
        supplierRepository.delete(supplier);
    }
}
