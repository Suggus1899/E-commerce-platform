package com.ecommerce.cart.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @GetMapping("/health")
    public String healthCheck() {
        return "Cart Service is up and running with Redis!";
    }
}