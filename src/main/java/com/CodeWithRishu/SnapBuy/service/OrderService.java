package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.Entity.Order;
import com.CodeWithRishu.SnapBuy.dto.request.StripeRequest;
import com.CodeWithRishu.SnapBuy.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    /*Validate the user’s cart and selected items.
    Confirm product stock availability.
    Initiate payment (via integrated payment provider).
    On success, create an order and persist it.
    Deduct inventory from stock.
    Send an email asynchronously to the user confirming the order*/

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final PaymentService paymentService;
    private final EmailService emailService;

    public void placeOrder(int userId) {
        Cart cart = cartService.getCartByUserId(userId);

        // 1. Check stock availability
        productService.checkStock(cart.getItems());

        // 2. Process payment
        paymentService.createOrderByStripe(
                StripeRequest.builder()
                        .setAmount(cart.getTotalAmount())
                        .setCurrency("usd")
                        .setDescription("Order for user " + userId)
                        .build()
        );

        // 3. Create order and persist it
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderItems(cart.getItems().stream()
                .map(item -> new OrderItem(item.getProductId(), item.getQuantity(), item.getPrice()))
                .collect(Collectors.toList()));
        order.setTotalAmount(cart.getTotalAmount());
        order.setStatus("PLACED");
        orderRepository.save(order);

        // 4. Deduct inventory
        cart.getItems().forEach(item ->
                productService.deductStock(item.getProductId(), item.getQuantity())
        );

        // 5. Send confirmation email asynchronously
        emailService.sendOrderConfirmationAsync(userId, order);

        // 6. Optionally, clear the user's cart
        cartService.clearCart(userId);
    }
}