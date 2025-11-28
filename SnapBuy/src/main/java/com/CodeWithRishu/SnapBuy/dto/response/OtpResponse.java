package com.CodeWithRishu.SnapBuy.dto.response;

import java.time.Instant;

public record OtpResponse(boolean success,
                          String message,
                          Instant expiresAt) {
}