package com.CodeWithRishu.SnapBuy.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StripeRequest {
    private String productName;
    private long quantity;
    private Long amount;
    private String currency;
}