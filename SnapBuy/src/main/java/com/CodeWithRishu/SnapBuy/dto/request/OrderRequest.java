package com.CodeWithRishu.SnapBuy.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OrderRequest(
        @NotBlank(message = "Customer name is required")
        @NotNull(message = "Customer name cannot be null")
        String customerName,
        @Email
        String email,
        List<OrderItemRequest> items
) {
}