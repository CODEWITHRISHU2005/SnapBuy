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

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
                .fromUriString(frontendUrl)
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
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937;">
                
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            
                            <table width="100%%" max-width="600px" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                                
                                <tr>
                                    <td align="center" style="background-color: #2563eb; padding: 30px 20px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">SnapBuy</h1>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Hi %s,</h2>
                                        <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                                            You recently requested to sign in to your <strong>SnapBuy</strong> account. Click the button below to securely access your account.
                                        </p>
                                        
                                        <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="padding: 10px 0 30px 0;">
                                                    <a href="%s" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">Sign In Securely</a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 16px;">
                                            <em>Note: This link will expire in <strong>%d minutes</strong> for your security.</em>
                                        </p>
                                        <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 0;">
                                            If you did not request this email, please safely ignore it. Your account remains secure.
                                        </p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 30px; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                            &copy; 2026 SnapBuy. All rights reserved.<br>
                                            This is an automated message. Please do not reply.
                                        </p>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """, username, magicLink, magicLinkExpirySeconds / 60);
    }
}