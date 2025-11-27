package com.CodeWithRishu.SnapBuy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "http://localhost:5000")
public class SnapBuyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SnapBuyApplication.class, args);
    }

}