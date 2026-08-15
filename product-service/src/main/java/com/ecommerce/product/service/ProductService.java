package com.ecommerce.product.service;

import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private ProductRepository productRepository;

    public Page<Product> search(String categoryId, Double minPrice, Double maxPrice,
            Boolean featured, Boolean onSale, Boolean isNew,
            Map<String, String> attributeFilters, Pageable pageable) {

        List<Criteria> criteriaList = new ArrayList<>();
        criteriaList.add(Criteria.where("active").is(true));

        if (categoryId != null) {
            criteriaList.add(Criteria.where("categoryId").is(categoryId));
        }
        if (minPrice != null) {
            criteriaList.add(Criteria.where("price").gte(minPrice));
        }
        if (maxPrice != null) {
            criteriaList.add(Criteria.where("price").lte(maxPrice));
        }
        if (featured != null) {
            criteriaList.add(Criteria.where("featured").is(featured));
        }
        if (onSale != null) {
            criteriaList.add(Criteria.where("onSale").is(onSale));
        }
        if (isNew != null && isNew) {
            criteriaList.add(Criteria.where("isNew").is(true));
        }
        if (attributeFilters != null) {
            for (Map.Entry<String, String> entry : attributeFilters.entrySet()) {
                criteriaList.add(Criteria.where("attributes." + entry.getKey()).is(entry.getValue()));
            }
        }

        Criteria[] criteriaArray = criteriaList.toArray(new Criteria[0]);

        Query countQuery = new Query();
        countQuery.addCriteria(new Criteria().andOperator(criteriaArray));
        long total = mongoTemplate.count(countQuery, Product.class);

        Query query = new Query();
        query.addCriteria(new Criteria().andOperator(criteriaArray));
        query.with(pageable);

        List<Product> content = mongoTemplate.find(query, Product.class);

        return new PageImpl<>(content, pageable, total);
    }

    public String generateUniqueSlug(String name) {
        String base = normalizeToSlug(name);
        String slug = base;
        while (productRepository.existsBySlug(slug)) {
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
            slug = "item";
        }
        return slug;
    }
}
