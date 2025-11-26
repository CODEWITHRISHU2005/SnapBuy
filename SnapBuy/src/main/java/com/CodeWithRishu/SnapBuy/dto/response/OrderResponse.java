package com.CodeWithRishu.SnapBuy.dto.response;

import com.CodeWithRishu.SnapBuy.dto.OrderStatus;

import java.time.LocalDate;
import java.util.List;

public record OrderResponse(
        String orderId,
        int userId,
        String customerName,
        String email,
        OrderStatus status,
        LocalDate orderDate,
        List<OrderItemResponse> items
) {
}