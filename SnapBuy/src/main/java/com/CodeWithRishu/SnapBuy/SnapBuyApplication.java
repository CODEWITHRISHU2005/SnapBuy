package com.CodeWithRishu.SnapBuy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@EnableScheduling
@CrossOrigin(origins = "${app.frontend.url}")
public class SnapBuyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SnapBuyApplication.class, args);
    }

}