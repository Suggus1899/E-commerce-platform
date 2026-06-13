package com.ecommerce.notification.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationListener {

    @RabbitListener(queues = "order.created.queue")
    public void handleOrderCreatedEvent(String message) {
        System.out.println("=========================================");
        System.out.println("NOTIFICATION SERVICE RECEIVED EVENT");
        System.out.println("Payload: " + message);
        System.out.println("Action: Simulating Email sending to User...");
        System.out.println("=========================================");
        // Here you would parse the JSON and use SendGrid, JavaMailSender, Twilio, etc.
    }
}