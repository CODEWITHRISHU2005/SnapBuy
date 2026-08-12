package com.CodeWithRishu.SnapBuy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SnapBuyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SnapBuyApplication.class, args);
    }

}