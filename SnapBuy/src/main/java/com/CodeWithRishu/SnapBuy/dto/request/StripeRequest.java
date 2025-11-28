package com.CodeWithRishu.SnapBuy.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StripeRequest(
        @NotBlank(message = "Product name is required")
        String productName,
        @Size(min = 1, max = 20, message = "Quantity must be between 1 and 20")
        long quantity,
        @Min(value = 0, message = "Amount must be greater than or equal to 0")
        long amount,
        @NotBlank(message = "Currency is required")
        String currency) {
}