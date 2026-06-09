package com.CodeWithRishu.SnapBuy.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.ott.OneTimeToken;
import org.springframework.security.web.authentication.ott.OneTimeTokenGenerationSuccessHandler;
import org.springframework.security.web.authentication.ott.RedirectOneTimeTokenGenerationSuccessHandler;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Component
@Slf4j
@RequiredArgsConstructor
public class MagicLinkOttGenerationSuccessHandler implements OneTimeTokenGenerationSuccessHandler {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private static final String BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender-name:SnapBuy}")
    private String senderName;

    @Value("${spring.mail.from:noreply@snapbuy.com}")
    private String mailFrom;

    @Value("${ott.token.expiry.seconds}")
    private int magicLinkExpirySeconds;

    private final OneTimeTokenGenerationSuccessHandler redirectHandler =
            new RedirectOneTimeTokenGenerationSuccessHandler("/ott/sent");

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, OneTimeToken oneTimeToken)
            throws IOException, ServletException {

        String magicLink = buildMagicLink(request, oneTimeToken);
        log.info("Generated magic link for user {}: {}", oneTimeToken.getUsername(), magicLink);

        String username = oneTimeToken.getUsername();
        String recipientEmail = this.getUserEmail(username);

        sendMagicLinkAsync(recipientEmail, magicLink, username);

        this.redirectHandler.handle(request, response, oneTimeToken);
    }

    private String buildMagicLink(HttpServletRequest request, OneTimeToken oneTimeToken) {
        return UriComponentsBuilder
                .fromUriString(UrlUtils.buildFullRequestUrl(request))
                .replacePath(request.getContextPath())
                .replaceQuery(null)
                .fragment(null)
                .path("/login/ott")
                .queryParam("token", oneTimeToken.getTokenValue())
                .toUriString();
    }

    private String getUserEmail(String userName) {
        return Optional.ofNullable(userName)
                .filter(email -> !email.isBlank())
                .orElseThrow(() -> new IllegalArgumentException("Username cannot be null or empty"));
    }

    private void sendMagicLinkAsync(String recipientEmail, String magicLink, String username) {
        CompletableFuture.runAsync(() -> sendMagicLinkEmailViaBrevo(recipientEmail, magicLink, username))
                .exceptionally(throwable -> {
                    log.error("Failed to execute async magic link email for user: {}", username, throwable);
                    return null;
                });
    }

    private void sendMagicLinkEmailViaBrevo(String recipientEmail, String magicLink, String username) {
        try {
            String safeName = username != null ? username.replace("\"", "\\\"") : "User";
            String htmlContent = buildHtmlEmailContent(magicLink, safeName);

            String jsonPayload = "{"
                    + "\"sender\":{\"name\":\"" + senderName + "\",\"email\":\"" + mailFrom + "\"},"
                    + "\"to\":[{\"email\":\"" + recipientEmail + "\",\"name\":\"" + safeName + "\"}],"
                    + "\"subject\":\"Your SnapBuy Magic Link - Sign In Securely\","
                    + "\"htmlContent\":\"" + htmlContent + "\""
                    + "}";

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_EMAIL_URL))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            int statusCode = response.statusCode();
            if (statusCode >= 200 && statusCode < 300) {
                log.info("Magic link email sent successfully to: {}", recipientEmail);
            } else {
                log.error("Brevo Email API error. Status: {}, Response: {}", statusCode, response.body());
                throw new RuntimeException("Brevo API returned status " + statusCode);
            }
        } catch (Exception e) {
            log.error("Failed to send magic link email to: {}", recipientEmail, e);
            throw new RuntimeException("Failed to send magic link email", e);
        }
    }

    private String buildHtmlEmailContent(String magicLink, String username) {
        return String.format(
                "<p>Hi %s,</p>" +
                        "<p>You requested to sign in to your SnapBuy account. Click the secure link below to sign in:</p>" +
                        "<p><a href='%s' style='display:inline-block;padding:10px 20px;background-color:#007BFF;color:#FFF;text-decoration:none;border-radius:5px;'>Sign In Securely</a></p>" +
                        "<p>This link will expire in %d minutes for your security.</p>" +
                        "<p>If you didn't request this login, please ignore this email.</p>" +
                        "<br><p>Best regards,<br>The SnapBuy Team</p>" +
                        "<hr><p><small>This is an automated message. Please do not reply to this email.</small></p>",
                username, magicLink, magicLinkExpirySeconds / 60
        );
    }
}