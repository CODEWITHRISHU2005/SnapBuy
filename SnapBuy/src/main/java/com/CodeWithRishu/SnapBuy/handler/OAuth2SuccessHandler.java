package com.CodeWithRishu.SnapBuy.handler;

import com.CodeWithRishu.SnapBuy.dto.Provider;
import com.CodeWithRishu.SnapBuy.dto.Role;
import com.CodeWithRishu.SnapBuy.entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.RefreshTokenRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import com.CodeWithRishu.SnapBuy.service.JwtService;
import com.CodeWithRishu.SnapBuy.service.RefreshTokenService;
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
import java.util.Set;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.auth.success-redirect}")
    private String frontendSuccessRedirectURL;

    @Value("${app.auth.failure-redirect}")
    private String frontendFailureRedirectURL;

    @Transactional
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        if (!(authentication instanceof OAuth2AuthenticationToken token)) {
            log.error("Unsupported authentication type: {}", authentication.getClass());
            response.sendRedirect(frontendFailureRedirectURL);
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String registrationId = token.getAuthorizedClientRegistrationId();

        log.debug("OAuth2 user attributes: {}", oAuth2User.getAttributes());

        User user = processOAuth2User(oAuth2User, registrationId);

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        refreshTokenRepository.save(refreshToken);

        String redirectUrl = String.format("%s?accessToken=%s&refreshToken=%s",
                frontendSuccessRedirectURL, accessToken, refreshToken.getToken());

        log.info("Login/Signup success for {}, roles={}, redirecting with tokens",
                user.getEmail(), user.getRoles());

        response.sendRedirect(redirectUrl);
    }

    private User processOAuth2User(OAuth2User oAuth2User, String registrationId) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String image = oAuth2User.getAttribute("picture");

        return userRepository.findByEmail(email).map(existingUser -> {
            existingUser.setName(name);
            existingUser.setProfileImage(image.getBytes());
            existingUser.setProvider(Provider.valueOf(registrationId.toUpperCase()));
            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .provider(Provider.GOOGLE)
                    .profileImage(image.getBytes())
                    .roles(Set.of(Role.USER))
                    .build();
            return userRepository.save(newUser);
        });
    }

}