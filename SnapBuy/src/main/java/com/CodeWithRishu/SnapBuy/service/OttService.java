package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.entity.OttToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.OttTokenRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OttService {

    private final OttTokenRepository ottTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private static final String BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender-name:SnapBuy}")
    private String senderName;

    @Value("${spring.mail.from}")
    private String mailFrom;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${ott.token.expiry.seconds:900}")
    private long tokenExpirySeconds;

    @Transactional
    public void generateMagicLink(String email) {
        log.info("Generating magic link for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        ottTokenRepository.deleteByUser(user);

        String tokenValue = UUID.randomUUID().toString();
        ottTokenRepository.save(OttToken.builder()
                .token(tokenValue)
                .expiryDate(Instant.now().plusSeconds(tokenExpirySeconds))
                .user(user)
                .build());

        String magicLink = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/login/ott")
                .queryParam("token", tokenValue)
                .toUriString();

        boolean isSent = sendOttEmailViaBrevo(user, magicLink);
        if (!isSent) {
            throw new RuntimeException("Failed to send magic link email. Transaction rolled back.");
        }
    }

    private boolean sendOttEmailViaBrevo(User user, String magicLink) {
        try {
            long minutes = tokenExpirySeconds / 60;
            String safeName = user.getName() != null ? user.getName() : "User";
            String htmlContent = buildHtmlEmailContent(magicLink, safeName, minutes);

            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", senderName, "email", mailFrom),
                    "to", List.of(Map.of("email", user.getEmail(), "name", safeName)),
                    "subject", "Your SnapBuy Sign-In Link",
                    "htmlContent", htmlContent
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

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
                log.info("Magic link email sent successfully to {}", user.getEmail());
                return true;
            } else {
                log.error("Brevo Email API error. Status: {}, Response: {}", statusCode, response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to execute native HttpClient request to Brevo for email: {}", user.getEmail(), e);
            return false;
        }
    }

    @Transactional
    public JwtResponse loginWithOttToken(String token) {
        log.info("Attempting login with OTT token");

        OttToken ottToken = ottTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token."));

        if (ottToken.getExpiryDate().isBefore(Instant.now())) {
            ottTokenRepository.delete(ottToken);
            throw new IllegalArgumentException("Token has expired.");
        }

        User user = ottToken.getUser();

        ottTokenRepository.delete(ottToken);

        return JwtResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .refreshToken(refreshTokenService.createRefreshToken(user.getEmail()).getToken())
                .build();
    }

    @Scheduled(fixedRateString = "${ott.cleanup-rate-ms}")
    @Transactional
    public void cleanupExpiredOttTokens() {
        int count = ottTokenRepository.deleteByExpiryDateBefore(Instant.now());
        if (count > 0) {
            log.info("Scheduled task cleaned up {} expired OTT records", count);
        }
    }

    private String buildHtmlEmailContent(String magicLink, String username, long minutes) {
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
            """, username, magicLink, minutes);
    }
}