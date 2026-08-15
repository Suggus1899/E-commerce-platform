package com.ecommerce.cart.controller;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.repository.CartRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;

    public CartController(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Cart Service is up and running with Redis!";
    }

    private String resolveCartId(String pathCartId, HttpServletRequest request) {
        if ("me".equals(pathCartId)) {
            Object userId = request.getAttribute("jwt_userId");
            if (userId == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Se requiere autenticacion para usar el carrito 'me'");
            }
            return "user:" + userId;
        }
        if (pathCartId.startsWith("user:")) {
            Object userId = request.getAttribute("jwt_userId");
            if (userId == null || !pathCartId.equals("user:" + userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "No podes acceder al carrito de otro usuario");
            }
        }
        return pathCartId;
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCart(@PathVariable String cartId, HttpServletRequest request) {
        String id = resolveCartId(cartId, request);
        Cart cart = cartRepository.findById(id).orElse(new Cart(id));
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{cartId}/items")
    public ResponseEntity<Cart> addItem(@PathVariable String cartId,
                                         @RequestBody CartItem item,
                                         HttpServletRequest request) {
        String id = resolveCartId(cartId, request);
        Cart cart = cartRepository.findById(id).orElse(new Cart(id));

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(item.getProductId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem existingItem = existing.get();
            existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
        } else {
            cart.getItems().add(item);
        }

        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/{cartId}/items/{productId}")
    public ResponseEntity<Cart> updateItemQuantity(@PathVariable String cartId,
                                                    @PathVariable String productId,
                                                    @RequestBody Map<String, Integer> body,
                                                    HttpServletRequest request) {
        String id = resolveCartId(cartId, request);
        Optional<Cart> cartOpt = cartRepository.findById(id);
        if (cartOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Cart cart = cartOpt.get();

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();

        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        int quantity = body.getOrDefault("quantity", 0);
        if (quantity <= 0) {
            cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        } else {
            existing.get().setQuantity(quantity);
        }

        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{cartId}/items/{productId}")
    public ResponseEntity<Cart> removeItem(@PathVariable String cartId,
                                            @PathVariable String productId,
                                            HttpServletRequest request) {
        String id = resolveCartId(cartId, request);
        Optional<Cart> cartOpt = cartRepository.findById(id);
        if (cartOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Cart cart = cartOpt.get();
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> deleteCart(@PathVariable String cartId, HttpServletRequest request) {
        String id = resolveCartId(cartId, request);
        cartRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", ex.getReason()));
    }
}
