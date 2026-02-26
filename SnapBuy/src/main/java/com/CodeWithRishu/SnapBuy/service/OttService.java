package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.entity.OttToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.OttTokenRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.sql.SQLException;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OttService {

    private final JavaMailSender javaMailSender;
    private final OttTokenRepository ottTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.api.base-url}")
    private String appBaseUrl;
    @Value("${spring.mail.from}")
    private String mailFrom;
    @Value("${ott.token.expiry.seconds}")
    private long tokenExpirySeconds;

    @Transactional(rollbackFor = SQLException.class)
    public void generateMagicLink(String email) {
        log.info("Generating magic link for user: {}", email);

        userRepository.findByEmail(email)
                .map(user -> {
                    ottTokenRepository.deleteByUser(user);

                    String tokenValue = UUID.randomUUID().toString();
                    ottTokenRepository.save(OttToken.builder()
                            .token(tokenValue)
                            .expiryDate(Instant.now().plusSeconds(tokenExpirySeconds))
                            .user(user)
                            .build());

                    return UriComponentsBuilder.fromHttpUrl(appBaseUrl)
                            .path("/api/ott/login")
                            .queryParam("token", tokenValue)
                            .toUriString();
                })
                .ifPresentOrElse(
                        link -> sendOttNotification(email, link),
                        () -> {
                            throw new IllegalArgumentException("User not found: " + email);
                        }
                );
    }

    private void sendOttNotification(String email, String magicLink) {
        userRepository.findByEmail(email).ifPresent(user -> {
            try {
                javaMailSender.send(getSimpleMailMessage(user, magicLink));
                log.info("Magic link email sent successfully to {}", email);
            } catch (MailException e) {
                log.error("Failed to send email to {}: {}", email, e.getMessage());
                throw new RuntimeException("Failed to send notification email.", e);
            }
        });
    }

    private SimpleMailMessage getSimpleMailMessage(User user, String magicLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(user.getEmail());
        message.setSubject("Your SnapBuy Sign-In Link");
        message.setText(String.format("""
                 Hello %s,
                
                 Click the link below to sign in to your SnapBuy account:
                
                 %s
                
                 This link is valid for %d minutes.
                """, user.getName(), magicLink, tokenExpirySeconds / 60));
        return message;
    }

    public JwtResponse loginWithOttToken(String token) {
        log.info("Logging in with OTT token: {}", token);

        return ottTokenRepository.findByToken(token)
                .filter(ottToken -> {
                    if (ottToken.getExpiryDate().isAfter(Instant.now())) return true;
                    ottTokenRepository.deleteByToken(token);
                    return false;
                })
                .map(ottToken -> {
                    User user = ottToken.getUser();
                    return JwtResponse.builder()
                            .accessToken(jwtService.generateToken(user))
                            .refreshToken(refreshTokenService.createRefreshToken(user.getEmail()).getToken())
                            .build();
                })
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token."));
    }
}