package com.inventory.management.service;

import com.inventory.management.dto.SubcategoryRequest;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.Category;
import com.inventory.management.model.Subcategory;
import com.inventory.management.repository.CategoryRepository;
import com.inventory.management.repository.SubcategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubcategoryService {

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.inventory.management.repository.ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<Subcategory> getAllSubcategories() {
        return subcategoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Subcategory> getSubcategoriesByCategory(Long categoryId) {
        return subcategoryRepository.findByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public Subcategory getSubcategoryById(Long id) {
        return subcategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", id));
    }

    @Transactional
    public Subcategory createSubcategory(SubcategoryRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (subcategoryRepository.findByNameAndCategoryId(request.getName(), category.getId()).isPresent()) {
            throw new BadRequestException("Subcategory '" + request.getName() + "' already exists under category '" + category.getName() + "'");
        }

        Subcategory subcategory = new Subcategory(request.getName(), request.getDescription(), category);
        return subcategoryRepository.save(subcategory);
    }

    @Transactional
    public Subcategory updateSubcategory(Long id, SubcategoryRequest request) {
        Subcategory subcategory = getSubcategoryById(id);

        if (request.getCategoryId() != null && !subcategory.getCategory().getId().equals(request.getCategoryId())) {
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            subcategory.setCategory(newCategory);
        }

        subcategory.setName(request.getName());
        subcategory.setDescription(request.getDescription());
        return subcategoryRepository.save(subcategory);
    }

    @Transactional
    public void deleteSubcategory(Long id) {
        Subcategory subcategory = getSubcategoryById(id);
        productRepository.clearSubcategoryReferences(id);
        subcategoryRepository.delete(subcategory);
    }
}
