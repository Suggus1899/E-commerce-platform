package com.ecommerce.product.controller;

import com.ecommerce.product.model.Category;
import com.ecommerce.product.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/categories")
public class CategoryAdminController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category body) {
        if (body.getSlug() == null || body.getSlug().isBlank()) {
            body.setSlug(generateUniqueSlug(body.getName()));
        }
        body.setActive(true);
        Category saved = categoryRepository.save(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable String id, @RequestBody Category body) {
        Optional<Category> existingOpt = categoryRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Category existing = existingOpt.get();
        boolean nameChanged = body.getName() != null && !body.getName().equals(existing.getName());
        existing.setName(body.getName());
        if (nameChanged) {
            existing.setSlug(generateUniqueSlug(body.getName()));
        }
        existing.setParentId(body.getParentId());
        existing.setActive(body.isActive());
        Category saved = categoryRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        Optional<Category> existingOpt = categoryRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Category existing = existingOpt.get();
        existing.setActive(false);
        categoryRepository.save(existing);
        return ResponseEntity.noContent().build();
    }

    private String generateUniqueSlug(String name) {
        String base = normalizeToSlug(name);
        String slug = base;
        while (categoryRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + UUID.randomUUID().toString().substring(0, 6);
        }
        return slug;
    }

    private String normalizeToSlug(String name) {
        if (name == null) {
            name = "";
        }
        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-+", "")
                .replaceAll("-+$", "");
        if (slug.isEmpty()) {
            slug = "category";
        }
        return slug;
    }
}
