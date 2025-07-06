package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.Entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.Entity.User;
import com.CodeWithRishu.SnapBuy.dto.request.AuthRequest;
import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.dto.request.RefreshTokenRequest;
import com.CodeWithRishu.SnapBuy.service.JwtService;
import com.CodeWithRishu.SnapBuy.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(RefreshTokenService refreshTokenService, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/signIn")
    public JwtResponse authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(authRequest.getUsername());
        return JwtResponse.builder()
                .accessToken(jwtService.generateToken(authRequest.getUsername()))
                .refreshToken(refreshToken.getToken()).build();
    }

    @PostMapping("/refreshToken")
    public JwtResponse refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        return refreshTokenService.findByToken(refreshTokenRequest.getToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserInfo)
                .map(userInfo -> {
                    String accessToken = jwtService.generateToken(userInfo.getName());
                    return JwtResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(refreshTokenRequest.getToken())
                            .build();
                }).orElseThrow(() -> new RuntimeException(
                        "Refresh token is not in database!"));
    }

    @PostMapping("/signUp")
    public JwtResponse register(@RequestBody User userInfo) {
        jwtService.addUser(userInfo);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userInfo.getName());

        return JwtResponse.builder()
                .accessToken(jwtService.generateToken(userInfo.getName()))
                .refreshToken(refreshToken.getToken()).build();
    }

}