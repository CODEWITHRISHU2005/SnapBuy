package com.CodeWithRishu.SnapBuy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.BooleanSchema;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.servers.ServerVariable;
import io.swagger.v3.oas.models.servers.ServerVariables;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.lang.NonNull;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class SwaggerConfig {

    private static final String API_DESCRIPTION =
            """
                    SnapBuy backend API that powers a modern E-Commerce Application.

                    Use the provided API to manage users, products, carts, orders and payments. Most protected endpoints require a Bearer (JWT) token.

                    Best practices:
                    - Use the `X-Request-ID` header to trace requests through logs.
                    - Provide `Accept: application/json` and `Content-Type: application/json` for payloads.
                """;

    private static final Map<String, String> STANDARD_ERROR_RESPONSES = new LinkedHashMap<>();
    static {
        STANDARD_ERROR_RESPONSES.put("400", "Bad Request");
        STANDARD_ERROR_RESPONSES.put("401", "Unauthorized - invalid or missing credentials");
        STANDARD_ERROR_RESPONSES.put("403", "Forbidden - insufficient permissions");
        STANDARD_ERROR_RESPONSES.put("404", "Not Found");
        STANDARD_ERROR_RESPONSES.put("429", "Too Many Requests - rate limit exceeded");
        STANDARD_ERROR_RESPONSES.put("500", "Internal Server Error");
    }

    @Value("${server.port:8080}")
    private String serverPort;
    @Value("${app.base.url:http://api.snapbuy.example.com}")
    private String baseUrl;
    @Value("${app.version:1.0.0}")
    private String appVersion;
    @Value("${app.terms-of-service:https://rishabhportfolio-phi.vercel.app/terms}")
    private String termsOfService;
    @Value("${app.oauth.authorization-url:}")
    private String oauthAuthorizationUrl;
    @Value("${app.oauth.token-url:}")
    private String oauthTokenUrl;

    @Bean
    public OpenAPI snapBuyOpenAPI() {
        return new OpenAPI()
                .info(buildApiInfo())
                .servers(buildServers())
                .components(buildComponents())
                .security(buildSecurityRequirements())
                .externalDocs(buildExternalDocumentation())
                .tags(List.of(
                        new Tag().name("Auth").description("Authentication and authorization endpoints"),
                        new Tag().name("Products").description("Product catalog and search operations"),
                        new Tag().name("Cart").description("Shopping cart operations"),
                        new Tag().name("Orders").description("Checkout and order management"),
                        new Tag().name("Payments").description("Payment processing and webhooks"),
                        new Tag().name("Admin").description("Administrative endpoints"),
                        new Tag().name("OTP").description("OTP generation and verification")
                ));
    }

    private Info buildApiInfo() {
        return new Info()
                .title("SnapBuy E-Commerce API")
                .description(API_DESCRIPTION)
                .version(appVersion)
                .termsOfService(termsOfService)
                .contact(buildContact())
                .license(buildLicense());
    }

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

    private Server buildServer(String url, String description) {
        ServerVariables variables = new ServerVariables();
        variables.addServerVariable("port", new ServerVariable()._default(serverPort).description("Server port"));
        return new Server()
                .url(url)
                .description(description)
                .variables(variables);
    }

    private List<Server> buildServers() {
        return List.of(
                buildServer(baseUrl + ":{port}", "Production Server"),
                buildServer("http://localhost:{port}", "Local Development Server")
        );
    }

    private Components buildComponents() {
        Components components = new Components()
                .addSecuritySchemes("BearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"")
                )
                .addSecuritySchemes("ApiKeyAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-API-KEY")
                                .description("API key for internal or third-party integrations")
                );

        components.addSchemas("ErrorResponse", new ObjectSchema()
                .addProperty("timestamp", new StringSchema().example("2026-08-12T09:59:00Z"))
                .addProperty("status", new IntegerSchema().example(500))
                .addProperty("error", new StringSchema().example("Internal Server Error"))
                .addProperty("message", new StringSchema().example("Unexpected error"))
                .addProperty("path", new StringSchema().example("/api/products/1"))
        );

        components.addSchemas("AuthRequest", new ObjectSchema()
                .addProperty("email", new StringSchema().example("user@example.com"))
                .addProperty("otp", new StringSchema().example("123456"))
        );

        components.addSchemas("AuthResponse", new ObjectSchema()
                .addProperty("accessToken", new StringSchema().example("eyJhbGciOiJI..."))
                .addProperty("refreshToken", new StringSchema().example("dGhpcy1pcy1hLXJlZnJlc2g="))
        );

        components.addSchemas("Product", new ObjectSchema()
                .addProperty("id", new IntegerSchema().example(1))
                .addProperty("name", new StringSchema().example("Wireless Headphones"))
                .addProperty("description", new StringSchema().example("Noise-cancelling over-ear headphones"))
                .addProperty("price", new IntegerSchema().example(2999))
                .addProperty("currency", new StringSchema().example("INR"))
                .addProperty("available", new BooleanSchema().example(true)) // was StringSchema("true")
        );

        components.addSchemas("CartItem", new ObjectSchema()
                .addProperty("productId", new IntegerSchema().example(1))
                .addProperty("quantity", new IntegerSchema().example(2))
        );

        components.addSchemas("OrderResponse", new ObjectSchema()
                .addProperty("orderId", new StringSchema().example("ORD_123456"))
                .addProperty("status", new StringSchema().example("PENDING"))
                .addProperty("totalAmount", new IntegerSchema().example(4598))
        );

        components.addSchemas("PaymentRequest", new ObjectSchema()
                .addProperty("amount", new IntegerSchema().example(4598))
                .addProperty("currency", new StringSchema().example("INR"))
                .addProperty("paymentMethodId", new StringSchema().example("pm_1J..."))
        );

        if (!oauthAuthorizationUrl.isBlank() || !oauthTokenUrl.isBlank()) {
            components.addSecuritySchemes("OAuth2",
                    new SecurityScheme()
                            .type(SecurityScheme.Type.OAUTH2)
                            .flows(createFlows())
                            .description("Optional OAuth2 Authorization Code flow")
            );
        }

        return components;
    }

    private @NonNull OAuthFlows createFlows() {
        OAuthFlows flows = new OAuthFlows();
        OAuthFlow authCode = new OAuthFlow();
        if (!oauthAuthorizationUrl.isBlank()) authCode.authorizationUrl(oauthAuthorizationUrl);
        if (!oauthTokenUrl.isBlank()) authCode.tokenUrl(oauthTokenUrl);

        Scopes scopes = new Scopes();
        scopes.addString("read", "Read access to protected resources");
        scopes.addString("write", "Write access to protected resources");

        authCode.scopes(scopes);
        flows.authorizationCode(authCode);
        return flows;
    }

    private List<SecurityRequirement> buildSecurityRequirements() {
        return List.of(new SecurityRequirement().addList("BearerAuth"));
    }

    private ExternalDocumentation buildExternalDocumentation() {
        return new ExternalDocumentation()
                .description("SnapBuy Complete Documentation")
                .url("https://rishabhportfolio-phi.vercel.app/docs");
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