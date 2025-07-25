package com.CodeWithRishu.SnapBuy.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {
    private List<OrderItemDto> items;
    private Long addressId;
    private String paymentMethod;
}