package com.ecommerce.product.controller;

import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    private static final Set<String> RESERVED_PARAMS = new HashSet<>(Arrays.asList(
            "categoryId", "minPrice", "maxPrice", "featured", "onSale", "isNew", "page", "size", "sort"));

    @GetMapping("/health")
    public String healthCheck() {
        return "Product Service is up and running!";
    }

    @GetMapping
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam Map<String, String> allParams) {

        Map<String, String> attributeFilters = new HashMap<>();
        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            if (!RESERVED_PARAMS.contains(entry.getKey())) {
                attributeFilters.put(entry.getKey(), entry.getValue());
            }
        }

        Pageable pageable = PageRequest.of(page, size, parseSort(sort));

        Page<Product> result = productService.search(categoryId, minPrice, maxPrice,
                featured, onSale, isNew, attributeFilters, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Product> getBySlug(@PathVariable String slug) {
        return productRepository.findBySlugAndActiveTrue(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Sort parseSort(String sort) {
        String[] parts = sort.split(",");
        String property = parts.length > 0 ? parts[0] : "createdAt";
        Sort.Direction direction = (parts.length > 1 && parts[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }
}