package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.dto.request.OtpRequest;
import com.CodeWithRishu.SnapBuy.dto.request.RefreshTokenRequest;
import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.dto.response.OtpResponse;
import com.CodeWithRishu.SnapBuy.entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.service.AuthService;
import com.CodeWithRishu.SnapBuy.service.JwtService;
import com.CodeWithRishu.SnapBuy.service.OtpService;
import com.CodeWithRishu.SnapBuy.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtService jwtService;
    private final OtpService otpService;
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/signIn")
    public JwtResponse authenticateAndGetToken(@Valid @RequestBody OtpRequest otpRequest) {
        OtpResponse verifyOtpResponse = otpService.verifyOtp(otpRequest);

        if (!verifyOtpResponse.success()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    verifyOtpResponse.message()
            );
        }

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(otpRequest.email());
        User user = refreshToken.getUserInfo();

        return JwtResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .refreshToken(refreshToken.getToken()).build();
    }

    @PostMapping("/signUp")
    public JwtResponse registerAndGetAccessAndRefreshToken(@Valid @RequestBody User userInfo) {
        authService.register(userInfo);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userInfo.getEmail());

        return JwtResponse.builder()
                .accessToken(jwtService.generateToken(userInfo))
                .refreshToken(refreshToken.getToken()).build();
    }

    @PostMapping("/refreshToken")
    public JwtResponse getRefreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return refreshTokenService.findByToken(refreshTokenRequest.token())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserInfo)
                .map(userInfo -> {
                    String accessToken = jwtService.generateToken(userInfo);
                    return JwtResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(refreshTokenRequest.token())
                            .build();
                }).orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Refresh token is invalid, expired, or not found in database.")
                );
    }

}