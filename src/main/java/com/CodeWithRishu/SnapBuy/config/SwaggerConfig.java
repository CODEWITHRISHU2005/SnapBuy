package com.CodeWithRishu.SnapBuy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI snapBuyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SnapBuy E-Commerce API")
                        .description("Backend REST API documentation for SnapBuy e-commerce application")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Rishabh Gupta")
                                .email("rg2822046@gmail.com")
                                .url("https://rishabhportfolio-phi.vercel.app/"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")));
    }
}
