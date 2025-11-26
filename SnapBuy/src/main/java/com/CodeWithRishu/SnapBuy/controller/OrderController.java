package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.dto.request.OrderRequest;
import com.CodeWithRishu.SnapBuy.dto.response.OrderResponse;
import com.CodeWithRishu.SnapBuy.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin
public class OrderController {

    private final OrderService orderService;

    @PostMapping("place")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody OrderRequest orderRequest) {
        OrderResponse orderResponse = orderService.placeOrder(orderRequest);
        return new ResponseEntity<>(orderResponse, HttpStatus.CREATED);
    }

    @GetMapping("/allOrders")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orderResponseList = orderService.getAllOrderResponses();
        return new ResponseEntity<>(orderResponseList, HttpStatus.OK);
    }

}