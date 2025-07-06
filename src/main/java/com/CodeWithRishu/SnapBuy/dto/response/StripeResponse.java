package com.CodeWithRishu.SnapBuy.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StripeResponse {
    private String sessionId;
    private String sessionUrl;
    private String message;
    private String url;
    private String status;
}