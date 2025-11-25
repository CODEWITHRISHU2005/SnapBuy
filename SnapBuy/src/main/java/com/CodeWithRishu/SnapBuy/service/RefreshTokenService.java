package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.RefreshTokenRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshToken createRefreshToken(String email) {
        log.info("Creating refresh token for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", email);
                    return new UsernameNotFoundException("User not found");
                });

        log.debug("Deleting old refresh token for user: {}", email);
        refreshTokenRepository.findByUserInfo(user).ifPresent(existingToken -> {
            log.debug("Old refresh token exists, deleting it for user: {}", email);
            refreshTokenRepository.delete(existingToken);
        });

        RefreshToken refreshToken = RefreshToken.builder()
                .userInfo(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(60000 * 60 * 24 * 15)) // 15 days expiry
                .build();

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        log.info("Refresh token created for user: {}, token: {}", email, savedToken.getToken());
        return savedToken;
    }

    public Optional<RefreshToken> findByToken(String token) {
        log.debug("Finding refresh token: {}", token);
        return refreshTokenRepository.findByToken(token)
                .map(this::verifyExpiration)
                .or(() -> {
                    ;
                    log.warn("Refresh token not found or expired: {}", token);
                    return Optional.empty();
                });
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        log.debug("Verifying expiration for refresh token: {}", token.getToken());
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            log.warn("Refresh token expired: {}", token.getToken());
            refreshTokenRepository.delete(token);
            throw new RuntimeException(token.getToken() + " Refresh token was expired. Please make a new sign in request");
        }
        log.info("Refresh token is valid: {}", token.getToken());
        return token;
    }
}