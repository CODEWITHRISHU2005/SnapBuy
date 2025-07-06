package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.Entity.OttToken;
import com.CodeWithRishu.SnapBuy.Entity.User;
import com.CodeWithRishu.SnapBuy.repository.OttTokenRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.UUID;

@Service
public class OttService {

    private static final Logger log = LoggerFactory.getLogger(OttService.class);
    private final JavaMailSender javaMailSender;
    private final OttTokenRepository ottTokenRepository;
    private final UserRepository userRepository;

    private final String appBaseUrl;
    private final long tokenExpirySeconds;
    private final String mailFrom;

    public OttService(
            JavaMailSender javaMailSender,
            UserRepository userRepository,
            OttTokenRepository ottTokenRepository,
            @Value("${app.base-url}") String appBaseUrl,
            @Value("${ott.token.expiry-seconds}") long tokenExpirySeconds,
            @Value("${spring.mail.from}") String mailFrom
    ) {
        this.ottTokenRepository = ottTokenRepository;
        this.userRepository = userRepository;
        this.javaMailSender = javaMailSender;
        this.appBaseUrl = appBaseUrl;
        this.tokenExpirySeconds = tokenExpirySeconds;
        this.mailFrom = mailFrom;
    }

    @Transactional
    public void generateMagicLink(String username) {
        log.info("Generating magic link for user: {}", username);
        User user = userRepository.findByName(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new IllegalArgumentException("User not found: " + username);
                });

        String tokenValue = UUID.randomUUID().toString();

        ottTokenRepository.deleteByUser(user);
        log.debug("Deleted old OTT token for user: {}", user.getName());

        OttToken ottToken = OttToken.builder()
                .token(tokenValue)
                .expiryDate(Instant.now().plusSeconds(tokenExpirySeconds))
                .user(user)
                .build();

        ottTokenRepository.save(ottToken);
        log.info("Created new OTT token for user: {}", user.getName());

        String magicLink = UriComponentsBuilder.fromHttpUrl(appBaseUrl)
                .path("/api/v1/ott/login")
                .queryParam("token", tokenValue)
                .toUriString();

        log.info("Generated magic link for user {}: {}", user.getName(), magicLink);

        sendOttNotification(user, magicLink);
    }

    private void sendOttNotification(User user, String magicLink) {
        try {
            SimpleMailMessage message = getSimpleMailMessage(user, magicLink);
            javaMailSender.send(message);
            log.info("Magic link email sent successfully to {}", user.getEmail());
        } catch (MailException e) {
            log.error("Failed to send magic link email to {}: {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to send notification email.", e);
        }
    }

    private SimpleMailMessage getSimpleMailMessage(User user, String magicLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(user.getEmail());
        message.setSubject("Your SnapBuy Sign-In Link");

        String messageBody = String.format("""
                 Hello %s,
                
                 Click the link below to sign in to your SnapBuy account:
                
                 %s
                
                 This link is valid for %d minutes. If you did not request this, please ignore this email.
                """, user.getName(), magicLink, tokenExpirySeconds / 60);

        message.setText(messageBody);
        return message;
    }
}