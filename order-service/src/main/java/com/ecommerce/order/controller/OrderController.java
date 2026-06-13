package com.ecommerce.order.controller;

import com.ecommerce.order.model.Order;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.messaging.OrderProducer;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderProducer orderProducer;

    public OrderController(OrderRepository orderRepository, OrderProducer orderProducer) {
        this.orderRepository = orderRepository;
        this.orderProducer = orderProducer;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Order Service is up and running!";
    }

    @PostMapping("/mock-create")
    public Order mockCreateOrder(@RequestParam Long userId, @RequestParam Double amount) {
        // Save to Database
        Order order = new Order(userId, amount, "PENDING");
        order = orderRepository.save(order);
        
        // Emit Event to RabbitMQ
        orderProducer.sendOrderCreatedEvent(order.getId(), order.getUserId());
        
        return order;
    }
}