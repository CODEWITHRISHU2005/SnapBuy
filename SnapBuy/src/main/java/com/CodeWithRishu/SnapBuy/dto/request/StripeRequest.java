package com.CodeWithRishu.SnapBuy.dto.request;

public record StripeRequest(
        String productName,
        long quantity,
        long amount,
        String currency) {
}