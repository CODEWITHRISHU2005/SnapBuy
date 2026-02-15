package com.CodeWithRishu.SnapBuy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${app.api.base-url}")
    private String baseUrl;

    @Bean
    public OpenAPI snapBuyOpenAPI() {
        return new OpenAPI()
                .info(buildApiInfo())
                .servers(buildServers())
                .components(buildComponents())
                .security(buildSecurityRequirements())
                .externalDocs(buildExternalDocumentation());
    }

    private Info buildApiInfo() {
        return new Info()
                .title("SnapBuy E-Commerce API")
                .description(buildDescription)
                .version("v2.0.0")
                .contact(buildContact())
                .license(buildLicense())
                .termsOfService("https://rishabhportfolio-phi.vercel.app/terms");
    }

    private static final String buildDescription =
            """
                ## SnapBuy E-Commerce REST API
                
                A comprehensive backend API for a modern e-commerce platform with full-featured shopping capabilities.
                
                ### Key Features:
                * **User Management**: Authentication, authorization, and profile management
                * **Product Catalog**: Browse, search, and filter products with categories
                * **Shopping Cart**: Add, update, and manage cart items
                * **Order Processing**: Complete checkout and order management
                * **Payment Integration**: Secure payment processing
                * **Inventory Management**: Real-time stock tracking
                * **Admin Dashboard**: Complete administrative controls
                
                ### Technologies:
                * Spring Boot 3.x
                * Spring Security with JWT
                * Spring Data JPA
                * MySQL Database
                * RESTful Architecture
                
                ### Authentication:
                Most endpoints require JWT authentication. Use the `/auth/login` endpoint to obtain a token.
                """;

    private Contact buildContact() {
        return new Contact()
                .name("Rishabh Gupta")
                .email("rg2822046@gmail.com")
                .url("https://rishabhportfolio-phi.vercel.app/");
    }

    private License buildLicense() {
        return new License()
                .name("Apache License 2.0")
                .url("https://www.apache.org/licenses/LICENSE-2.0");
    }

    private List<Server> buildServers() {
        Server localServer = new Server()
                .url(baseUrl + ":" + serverPort)
                .description("Local Development Server");

        Server productionServer = new Server()
                .url("https://api.snapbuy.com")
                .description("Production Server");

        Server stagingServer = new Server()
                .url("https://staging-api.snapbuy.com")
                .description("Staging Server");

        return List.of(localServer, productionServer, stagingServer);
    }

    private Components buildComponents() {
        return new Components()
                .addSecuritySchemes("Bearer Authentication",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT token obtained from /auth/login endpoint")
                )
                .addSecuritySchemes("API Key",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-API-KEY")
                                .description("API key for third-party integrations")
                );
    }

    private List<SecurityRequirement> buildSecurityRequirements() {
        return List.of(
                new SecurityRequirement().addList("Bearer Authentication")
        );
    }

    private ExternalDocumentation buildExternalDocumentation() {
        return new ExternalDocumentation()
                .description("SnapBuy Complete Documentation")
                .url("https://rishabhportfolio-phi.vercel.app/docs");
    }
}