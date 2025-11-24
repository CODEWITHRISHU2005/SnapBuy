package com.CodeWithRishu.SnapBuy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StripeResponse {
    private String sessionId;
    private String sessionUrl;
    private String message;
    private String url;
    private String status;
}