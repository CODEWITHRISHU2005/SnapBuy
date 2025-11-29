package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.OrderStatus;
import com.CodeWithRishu.SnapBuy.dto.request.OrderItemRequest;
import com.CodeWithRishu.SnapBuy.dto.request.OrderRequest;
import com.CodeWithRishu.SnapBuy.dto.response.OrderItemResponse;
import com.CodeWithRishu.SnapBuy.dto.response.OrderResponse;
import com.CodeWithRishu.SnapBuy.entity.Order;
import com.CodeWithRishu.SnapBuy.entity.OrderItem;
import com.CodeWithRishu.SnapBuy.entity.Product;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.OrderRepository;
import com.CodeWithRishu.SnapBuy.repository.ProductRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final VectorStore vectorStore;
    private final UserRepository userRepository;

    @Transactional
    @CacheEvict(value = "allOrders", allEntries = true)
    public OrderResponse placeOrder(OrderRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("Authentication required to place an order.");
        }

        String userEmail = null;
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oAuth2User) {
            userEmail = oAuth2User.getAttribute("email");
        } else if (principal instanceof UserDetails userDetails) {
            userEmail = userDetails.getUsername();
        } else {
            userEmail = authentication.getName();
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: "));

        Order order = new Order();
        String orderId = "ORD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        order.setOrderId(orderId);
        order.setCustomerName(request.customerName());
        order.setEmail(request.email());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDate.now());
        order.setUser(user);

//            String filter = String.format("productId == %s", String.valueOf(product.getId()));
//            vectorStore.delete(filter);
//
//            String updatedContent = String.format("""
//
//                            Product Name: %s
//                            Description: %s
//                            Brand: %s
//                            Category: %s
//                            Price: %.2f
//                            Release Date: %s
//                            Available: %s
//                            Stock: %s
//                            """,
//                    product.getName(),
//                    product.getDescription(),
//                    product.getBrand(),
//                    product.getCategory(),
//                    product.getPrice(),
//                    product.getReleaseDate(),
//                    product.isProductAvailable(),
//                    product.getStockQuantity()
//            );
//
//            Document UpdatedDoc = new Document(
//                    UUID.randomUUID().toString(),
//                    updatedContent,
//                    Map.of("productId", String.valueOf(product.getId()))
//            );
//
//            vectorStore.add(List.of(UpdatedDoc));

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequest itemReq : request.items()) {

            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.productId()));

            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .quantity(itemReq.quantity())
                    .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())))
                    .order(order)
                    .build();
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

//        StringBuilder content = new StringBuilder();
//        content.append("Order Summary: \n");
//        content.append("Order  ID: ").append(savedOrder.getOrderId()).append("\n");
//        content.append("Customer: ").append(savedOrder.getCustomerName()).append("\n");
//        content.append("Email: ").append(savedOrder.getEmail()).append("\n");
//        content.append("Date: ").append(savedOrder.getOrderDate()).append("\n");
//        content.append("Status: ").append(savedOrder.getStatus()).append("\n");
//        content.append("Products: \n");
//
//        for (OrderItem orderItem : savedOrder.getOrderItems()) {
//            content.append("- ").append(orderItem.getProduct().getName())
//                    .append(" x ").append(orderItem.getQuantity())
//                    .append(" = ").append(orderItem.getTotalPrice()).append("\n");
//        }
//
//        Document document = new Document(
//                UUID.randomUUID().toString(),
//                content.toString(),
//                Map.of("orderId", savedOrder.getOrderId())
//        );
//
//        vectorStore.add(List.of(document));

        List<OrderItemResponse> itemResponses = savedOrder.getOrderItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getTotalPrice()
                )).toList();


        return new OrderResponse(
                savedOrder.getOrderId(),
                savedOrder.getUser().getId(),
                savedOrder.getCustomerName(),
                savedOrder.getEmail(),
                savedOrder.getStatus(),
                savedOrder.getOrderDate(),
                itemResponses
        );
    }

    @Transactional
    @Cacheable("allOrders")
    public List<OrderResponse> getAllOrderResponses() {

        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> orderResponses = new ArrayList<>();

        for (Order order : orders) {


            List<OrderItemResponse> itemResponses = new ArrayList<>();

            for (OrderItem item : order.getOrderItems()) {
                OrderItemResponse orderItemResponse = new OrderItemResponse(
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getTotalPrice()
                );
                itemResponses.add(orderItemResponse);

            }
            OrderResponse orderResponse = new OrderResponse(
                    order.getOrderId(),
                    order.getUser().getId(),
                    order.getCustomerName(),
                    order.getEmail(),
                    order.getStatus(),
                    order.getOrderDate(),
                    itemResponses
            );
            orderResponses.add(orderResponse);
        }

        return orderResponses;
    }

}