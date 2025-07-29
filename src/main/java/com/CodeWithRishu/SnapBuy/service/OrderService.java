package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.Entity.Order;
import com.CodeWithRishu.SnapBuy.Entity.OrderItem;
import com.CodeWithRishu.SnapBuy.Entity.Product;
import com.CodeWithRishu.SnapBuy.Entity.User;
import com.CodeWithRishu.SnapBuy.repository.OrderRepository;
import com.CodeWithRishu.SnapBuy.repository.ProductRepository;
import com.CodeWithRishu.SnapBuy.dto.OrderStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Autowired
    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    @Transactional
    public Order placeOrder(User user, String paymentMethod) {
        log.info("Placing order for user: {}", user.getEmail());
        Cart cart = cartService.getCartByUser(user);
        if (cart == null || cart.getItems().isEmpty()) {
            log.warn("Attempted to place order with empty cart for user: {}", user.getEmail());
            throw new IllegalArgumentException("Cannot place an order with an empty cart.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setPlacedAt(LocalDateTime.now());
        order.setPaymentMethod(paymentMethod);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(user.getAddress());

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                log.error("Insufficient stock for product: {} (Requested: {}, Available: {})", product.getName(), cartItem.getQuantity(), product.getStockQuantity());
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setOrder(order);
            return orderItem;
        }
    }
}