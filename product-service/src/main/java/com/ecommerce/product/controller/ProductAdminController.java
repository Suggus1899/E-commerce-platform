package com.ecommerce.product.controller;

import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    @Value("${app.upload-dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product body) {
        if (body.getSlug() == null || body.getSlug().isBlank()) {
            body.setSlug(productService.generateUniqueSlug(body.getName()));
        }
        body.setActive(true);
        Instant now = Instant.now();
        body.setCreatedAt(now);
        body.setUpdatedAt(now);
        Product saved = productRepository.save(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product body) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product existing = existingOpt.get();
        existing.setName(body.getName());
        existing.setSlug(body.getSlug());
        existing.setDescription(body.getDescription());
        existing.setSku(body.getSku());
        existing.setPrice(body.getPrice());
        existing.setSalePrice(body.getSalePrice());
        existing.setStock(body.getStock());
        existing.setCategoryId(body.getCategoryId());
        existing.setImages(body.getImages());
        existing.setAttributes(body.getAttributes());
        existing.setFeatured(body.isFeatured());
        existing.setOnSale(body.isOnSale());
        existing.setIsNew(body.getIsNew());
        existing.setActive(body.isActive());
        existing.setUpdatedAt(Instant.now());
        Product saved = productRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product existing = existingOpt.get();
        existing.setActive(false);
        existing.setUpdatedAt(Instant.now());
        productRepository.save(existing);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product existing = existingOpt.get();
        Integer stock = body.get("stock");
        if (stock != null) {
            existing.setStock(stock);
        }
        existing.setUpdatedAt(Instant.now());
        Product saved = productRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Product> uploadImage(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Product existing = existingOpt.get();

        try {
            Path targetDir = Paths.get(uploadDir, "products");
            Files.createDirectories(targetDir);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID() + extension;
            Path destination = targetDir.resolve(filename);
            file.transferTo(destination);

            existing.getImages().add("/uploads/products/" + filename);
            existing.setUpdatedAt(Instant.now());
            Product saved = productRepository.save(existing);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
