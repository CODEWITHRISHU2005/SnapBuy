package com.CodeWithRishu.SnapBuy.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
@OpenAPIDefinition(
        info = @io.swagger.v3.oas.annotations.info.Info(
                title = "SnapBuy E-Commerce API",
                version = "${app.version:1.0.0}",
                description = """
                            SnapBuy backend API that powers a modern E-Commerce Application.
                        
                            Use the provided API to manage users, products, carts, orders and payments. Most protected endpoints require a Bearer (JWT) token.
                        
                            Best practices:
                            - Use the `X-Request-ID` header to trace requests through logs.
                            - Provide `Accept: application/json` and `Content-Type: application/json` for payloads.
                        """,
                termsOfService = "${app.terms-of-service:https://rishabhportfolio-phi.vercel.app/terms}",
                contact = @io.swagger.v3.oas.annotations.info.Contact(
                        name = "Rishabh Gupta",
                        email = "rg2822046@gmail.com",
                        url = "https://rishabhportfolio-phi.vercel.app/"
                ),
                license = @io.swagger.v3.oas.annotations.info.License(
                        name = "Apache License 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0"
                )
        ),
        servers = {
                @io.swagger.v3.oas.annotations.servers.Server(
                        url = "${app.base.url:http://api.snapbuy.example.com}:${server.port:8080}",
                        description = "Production Server"
                ),
                @io.swagger.v3.oas.annotations.servers.Server(
                        url = "http://localhost:${server.port:8080}",
                        description = "Local Development Server"
                )
        },
        tags = {
                @io.swagger.v3.oas.annotations.tags.Tag(name = "Auth", description = "Authentication and authorization endpoints"),
                @io.swagger.v3.oas.annotations.tags.Tag(name = "Products", description = "Product catalog and search operations"),
                @io.swagger.v3.oas.annotations.tags.Tag(name = "Cart", description = "Shopping cart operations"),
                @io.swagger.v3.oas.annotations.tags.Tag(name = "Orders", description = "Checkout and order management"),
                @io.swagger.v3.oas.annotations.tags.Tag(name = "Payments", description = "Payment processing and webhooks"),
                @io.swagger.v3.oas.annotations.tags.Tag(name = "Admin", description = "Administrative endpoints"),
                @io.swagger.v3.oas.annotations.tags.Tag(name = "OTP", description = "OTP generation and verification")
        },
        security = @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Authorization"),
        externalDocs = @io.swagger.v3.oas.annotations.ExternalDocumentation(
                description = "SnapBuy Complete Documentation",
                url = "https://rishabhportfolio-phi.vercel.app/docs"
        )
)
@io.swagger.v3.oas.annotations.security.SecuritySchemes({
        @io.swagger.v3.oas.annotations.security.SecurityScheme(
                name = "Authorization",
                type = SecuritySchemeType.HTTP,
                in = SecuritySchemeIn.HEADER,
                scheme = "bearer",
                bearerFormat = "JWT",
                description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        ),
        @io.swagger.v3.oas.annotations.security.SecurityScheme(
                name = "OAuth2",
                type = SecuritySchemeType.OAUTH2,
                description = "OAuth2 Authorization Code flow",
                flows = @io.swagger.v3.oas.annotations.security.OAuthFlows(
                        authorizationCode = @io.swagger.v3.oas.annotations.security.OAuthFlow(
                                authorizationUrl = "${app.oauth.authorization-url:}",
                                tokenUrl = "${app.oauth.token-url:}",
                                scopes = {
                                        @io.swagger.v3.oas.annotations.security.OAuthScope(name = "read", description = "Read access to protected resources"),
                                        @io.swagger.v3.oas.annotations.security.OAuthScope(name = "write", description = "Write access to protected resources")
                                }
                        )
                )
        )
})

public class SwaggerConfig {

    private static final Map<String, String> STANDARD_ERROR_RESPONSES = new LinkedHashMap<>();

    static {
        STANDARD_ERROR_RESPONSES.put("400", "Bad Request");
        STANDARD_ERROR_RESPONSES.put("401", "Unauthorized - invalid or missing credentials");
        STANDARD_ERROR_RESPONSES.put("403", "Forbidden - insufficient permissions");
        STANDARD_ERROR_RESPONSES.put("404", "Not Found");
        STANDARD_ERROR_RESPONSES.put("429", "Too Many Requests - rate limit exceeded");
        STANDARD_ERROR_RESPONSES.put("500", "Internal Server Error");
    }

    @Bean
    public GroupedOpenApi publicApi(OpenApiCustomizer openApiCustomizer, OperationCustomizer operationCustomizer) {
        return GroupedOpenApi.builder()
                .group("SnapBuy-API")
                .packagesToScan("com.CodeWithRishu.SnapBuy.controller")
                .addOpenApiCustomizer(openApiCustomizer)
                .addOperationCustomizer(operationCustomizer)
                .build();
    }

    @Bean
    @Primary
    public OpenApiCustomizer globalOpenApiCustomiser() {
        return openApi -> {
            if (openApi.getPaths() == null) return;

            openApi.getPaths().values().forEach(pathItem ->
                    pathItem.readOperations().forEach(operation -> {
                        ApiResponses responses = operation.getResponses();
                        if (responses == null) {
                            responses = new ApiResponses();
                            operation.setResponses(responses);
                        }
                        for (Map.Entry<String, String> entry : STANDARD_ERROR_RESPONSES.entrySet()) {
                            if (!responses.containsKey(entry.getKey())) {
                                responses.addApiResponse(entry.getKey(), new ApiResponse().description(entry.getValue()));
                            }
                        }
                    })
            );
        };
    }

    @Bean
    @Primary
    public OperationCustomizer globalOperationCustomizer() {
        return (operation, handlerMethod) -> {
            if (operation.getParameters() == null
                    || operation.getParameters().stream().noneMatch(p -> "X-Request-ID".equalsIgnoreCase(p.getName()))) {
                Parameter requestId = new Parameter()
                        .name("X-Request-ID")
                        .description("Optional request id for tracing")
                        .required(false)
                        .in("header");
                operation.addParametersItem(requestId);
            }

            try {
                String controllerName = handlerMethod.getBeanType().getSimpleName();
                String methodName = handlerMethod.getMethod().getName();
                if (controllerName.equalsIgnoreCase("AuthController")
                        && (methodName.equalsIgnoreCase("login") || methodName.equalsIgnoreCase("register"))) {
                    operation.setSecurity(List.of());
                }
            } catch (Exception ignored) {
            }

            return operation;
        };
    }
}