package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.dto.request.AuthRequest;
import com.CodeWithRishu.SnapBuy.dto.request.RefreshTokenRequest;
import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.service.JwtService;
import com.CodeWithRishu.SnapBuy.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/signIn")
    public JwtResponse authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.email(), authRequest.password())
        );

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(authRequest.email());
        return JwtResponse.builder()
                .accessToken(jwtService.generateToken(authRequest.email()))
                .refreshToken(refreshToken.getToken()).build();
    }

    @PostMapping("/signUp")
    public JwtResponse registerAndGetAccessAndRefreshToken(@RequestBody User userInfo) {
        if (userInfo.getName() == null || userInfo.getName().isEmpty()) {
            userInfo.setName(userInfo.getEmail().split("@")[0]);
        }
        if (userInfo.getRoles() == null || userInfo.getRoles().isEmpty()) {
            userInfo.setRoles("ROLE_USER");
        }
        jwtService.addUser(userInfo);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userInfo.getName());

        return JwtResponse.builder()
                .accessToken(jwtService.generateToken(userInfo.getName()))
                .refreshToken(refreshToken.getToken()).build();
    }

    @PostMapping("/refreshToken")
    public JwtResponse getRefreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        return refreshTokenService.findByToken(refreshTokenRequest.token())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserInfo)
                .map(userInfo -> {
                    String accessToken = jwtService.generateToken(userInfo.getName());
                    return JwtResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(refreshTokenRequest.token())
                            .build();
                }).orElseThrow(() -> new RuntimeException(
                        "Refresh token is not in database!"));
    }

}