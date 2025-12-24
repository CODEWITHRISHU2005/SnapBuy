package com.CodeWithRishu.SnapBuy.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record OrderRequest(
        @NotBlank(message = "Customer name is required")
        String customerName,
        @Email(message = "Email should be valid")
        @NotBlank(message = "Email is required")
        String email,
        List<OrderItemRequest> items
) {
}