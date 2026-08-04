package com.CodeWithRishu.SnapBuy.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProp {
    private int login;
    private int register;
    private int otp;
    private int ott;
    private int chat;
    private int orders;
    private int products;
    private int duration;
}