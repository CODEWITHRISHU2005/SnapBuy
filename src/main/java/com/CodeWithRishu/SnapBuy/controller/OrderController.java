package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.dto.response.ApiResponse;
import com.CodeWithRishu.SnapBuy.dto.request.OrderRequest;
import com.CodeWithRishu.SnapBuy.dto.response.OrderResponse;
import com.CodeWithRishu.SnapBuy.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(OrderRequest orderRequest) {
        OrderResponse orderResponse = orderService.placeOrder(orderRequest);
        return ResponseEntity.ok(orderResponse);
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        List<OrderResponse> orders = orderService.getOrdersOfCurrentUser();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok(new ApiResponse("Order cancelled successfully", true));
    }

    @PutMapping("/{orderId}/return")
    public ResponseEntity<ApiResponse> returnOrder(@PathVariable Long orderId) {
        orderService.requestReturn(orderId);
        return ResponseEntity.ok(new ApiResponse("Return requested", true));
    }

    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long orderId) {
        return orderService.generateInvoice(orderId);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {
        orderService.updateOrderStatus(orderId, status); // validate enum inside service
        return ResponseEntity.ok(new ApiResponse("Status updated", true));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/admin/status")
    public ResponseEntity<?> getOrderStatus() {
        return ResponseEntity.ok(orderService.getOrderStatus());
    }

}