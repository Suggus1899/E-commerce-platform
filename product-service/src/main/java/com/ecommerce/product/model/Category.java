package com.ecommerce.product.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "categories")
public class Category {

    @Id
    private String id;
    private String name;
    private String slug;
    private String parentId; // null = categoria raiz
    private boolean active = true;

    public Category() {}

    public Category(String name, String slug, String parentId) {
        this.name = name;
        this.slug = slug;
        this.parentId = parentId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
