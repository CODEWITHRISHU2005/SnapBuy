package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.Entity.OttToken;
import com.CodeWithRishu.SnapBuy.Entity.User;
import com.CodeWithRishu.SnapBuy.repository.OttTokenRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Service
public class OttService {

    private static final Logger log = LoggerFactory.getLogger(OttService.class);
    private final JavaMailSender javaMailSender;
    private final OttTokenRepository ottTokenRepository;
    private final UserRepository userRepository;

    @Autowired
    public OttService(JavaMailSender javaMailSender, UserRepository userRepository, OttTokenRepository ottTokenRepository) {
        this.ottTokenRepository = ottTokenRepository;
        this.userRepository = userRepository;
        this.javaMailSender = javaMailSender;
    }

    public void generateMagicLink(String username, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        log.info("Generating magic link for user: {}", username);
        User user = userRepository.findByName(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new IllegalArgumentException("User not found: " + username);
                });
        String tokenValue = UUID.randomUUID().toString();

        // Delete old token first
        ottTokenRepository.deleteByUser(user);
        log.debug("Deleted old OTT token for user: {}", user.getName());

        OttToken ottToken = OttToken.builder()
                .token(tokenValue)
                .expiryDate(java.time.Instant.now().plusSeconds(300)) // 5 min expiry
                .user(user)
                .build();

        log.info("Creating new OTT token for user: {}", user.getName());
        ottTokenRepository.save(ottToken);

        String magicLink = UriComponentsBuilder.fromHttpUrl(getBaseUrl(request))
                .path("/api/v1/ott/login")
                .queryParam("token", tokenValue)
                .toUriString();

        log.info("Generated magic link for user {}: {}", user.getName(), magicLink);

        sendOttNotification(user, magicLink);
    }

    private void sendOttNotification(User user, String magicLink) {
        try {
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                log.warn("Recipient email is null or empty for user: {}", user.getName());
                throw new IllegalArgumentException("Recipient email is null or empty for user: " + user.getName());
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("SnapBuy <rg2822046@gmail.com>");
            message.setTo(user.getEmail());
            message.setSubject("One Time Token - Magic Link");

            String messageBody = String.format("""
                     Hello %s,
                    
                     Use the following link to sign in to the application:
                    
                     %s
                    
                     This link is valid for a limited time. If you did not request this, please ignore this email.
                    """, user.getName(), magicLink);

            message.setText(messageBody);
            javaMailSender.send(message);
            log.info("Magic link email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send magic link email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();
        String baseUrl = scheme + "://" + serverName + (serverPort == 80 || serverPort == 443 ? "" : ":" + serverPort) + contextPath;
        log.debug("Base URL constructed: {}", baseUrl);
        return baseUrl;
    }
}