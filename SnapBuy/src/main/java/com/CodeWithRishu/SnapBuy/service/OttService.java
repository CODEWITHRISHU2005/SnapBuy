package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.entity.OttToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.OttTokenRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OttService {

    private final OttTokenRepository ottTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

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
            String safeName = user.getName() != null ? user.getName().replace("\"", "\\\"") : "User";

            String jsonPayload = "{"
                    + "\"sender\":{\"name\":\"" + senderName + "\",\"email\":\"" + mailFrom + "\"},"
                    + "\"to\":[{\"email\":\"" + user.getEmail() + "\",\"name\":\"" + safeName + "\"}],"
                    + "\"subject\":\"Your SnapBuy Sign-In Link\","
                    + "\"htmlContent\":\"<p>Hello " + safeName + ",</p><p>Click <a href='" + magicLink + "'>here</a> to sign in to your SnapBuy account.</p><p>This link is valid for " + minutes + " minutes.</p>\""
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
}