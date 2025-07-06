package com.CodeWithRishu.SnapBuy.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RazorpayRequest {
    private Long amount;
    private String currency;
    private String receipt;
}