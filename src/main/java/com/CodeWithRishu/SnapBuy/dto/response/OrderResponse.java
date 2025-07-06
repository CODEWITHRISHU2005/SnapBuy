package com.CodeWithRishu.SnapBuy.dto.response;

import com.CodeWithRishu.SnapBuy.dto.OrderStatus;
import com.CodeWithRishu.SnapBuy.dto.request.OrderItemDto;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long orderId;
    private OrderStatus orderStatus;
    private LocalDateTime placedAt;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private AddressDto shippingAddress;
    private List<OrderItemDto> items;
}