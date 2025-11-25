package com.CodeWithRishu.SnapBuy.handler;

import com.CodeWithRishu.SnapBuy.dto.Provider;
import com.CodeWithRishu.SnapBuy.entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.RefreshTokenRepository;
import com.CodeWithRishu.SnapBuy.service.JwtService;
import com.CodeWithRishu.SnapBuy.service.RefreshTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.auth.success-redirect}")
    private String frontendSuccessRedirectURL;

    @Value("${app.auth.failure-redirect}")
    private String frontendFailureRedirectURL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication) throws IOException, ServletException {
        AuthenticationSuccessHandler.super.onAuthenticationSuccess(request, response, chain, authentication);
    }

    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String registrationId = "unknown";

        if (authentication instanceof OAuth2AuthenticationToken token) {
            registrationId = token.getAuthorizedClientRegistrationId();
        }

        log.debug("OAuth2 user attributes: {}", oAuth2User.getAttributes());

        User user;
        if (registrationId.equals("google")) {
            String email = oAuth2User.getAttributes().getOrDefault("email", "").toString();
            String name = oAuth2User.getAttributes().getOrDefault("name", "").toString();
            String image = oAuth2User.getAttributes().getOrDefault("picture", "").toString();
            user = User.builder()
                    .email(email)
                    .name(name)
                    .provider(Provider.GOOGLE)
                    .profileImage(image)
                    .build();
            jwtService.registerForGoogle(user);
        } else {
            response.sendRedirect(frontendFailureRedirectURL);
            throw new RuntimeException("Failed to login with google for registrationId: " + registrationId);
        }

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        refreshTokenRepository.save(refreshToken);
        response.sendRedirect(frontendSuccessRedirectURL);
    }

}