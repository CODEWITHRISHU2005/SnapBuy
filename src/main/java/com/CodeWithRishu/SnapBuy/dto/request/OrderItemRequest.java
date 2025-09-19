package com.CodeWithRishu.SnapBuy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
        @NotBlank(message = "id cannot be empty") @NotNull(message = "id cannot be null") Long productId,
        @NotBlank(message = "please enter quantity") @NotNull(message = "quantity cannot be null") int quantity) {
}