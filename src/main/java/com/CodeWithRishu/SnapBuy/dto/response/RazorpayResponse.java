package com.CodeWithRishu.SnapBuy.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RazorpayResponse {
    private String orderId;
    private String razorpayKeyId;
    private Long amount;
    private String currency;
    private String status;
    private String message;
}