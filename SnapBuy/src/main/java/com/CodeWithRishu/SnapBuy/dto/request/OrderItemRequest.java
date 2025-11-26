package com.CodeWithRishu.SnapBuy.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record OrderItemRequest(
        @NotBlank(message = "id cannot be empty")
        Long productId,
        @NotBlank(message = "please enter quantity")
        @Min(value = 0, message = "Quantity must be greater than or equal to 0") int quantity) {
}