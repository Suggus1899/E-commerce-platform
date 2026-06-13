package com.ecommerce.order.messaging;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

@Service
public class OrderProducer {

    private final RabbitTemplate rabbitTemplate;
    public static final String QUEUE_NAME = "order.created.queue";

    public OrderProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME, true);
    }

    public void sendOrderCreatedEvent(Long orderId, Long userId) {
        String message = String.format("{\"orderId\":%d, \"userId\":%d}", orderId, userId);
        rabbitTemplate.convertAndSend(QUEUE_NAME, message);
        System.out.println("Message sent to RabbitMQ: " + message);
    }
}