package com.ecommerce.cart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import java.util.ArrayList;
import java.util.List;

@RedisHash("Cart")
public class Cart {
    
    @Id
    private String id; // Typically the User ID or a Session ID
    private List<CartItem> items = new ArrayList<>();

    public Cart() {}

    public Cart(String id) {
        this.id = id;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }
}