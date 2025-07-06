package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.Entity.OttToken;
import com.CodeWithRishu.SnapBuy.Entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.repository.OttTokenRepository;
import com.CodeWithRishu.SnapBuy.service.JwtService;
import com.CodeWithRishu.SnapBuy.service.OttService;
import com.CodeWithRishu.SnapBuy.service.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/ott")
public class OttController {

    private final OttService ottService;
    private final OttTokenRepository ottTokenRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Autowired
    public OttController(OttService ottService, OttTokenRepository ottTokenRepository, JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.ottService = ottService;
        this.ottTokenRepository = ottTokenRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/sent")
    public ResponseEntity<String> sendOtt(@RequestParam String username, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ottService.generateMagicLink(username, request, response);
        return ResponseEntity.ok("Magic link sent to your email. Please check your inbox.");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> loginWithOtt(@RequestParam String token) {
        OttToken ottToken = ottTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token, please request a new one."));

        if (ottToken.getExpiryDate().isBefore(Instant.now())) {
            ottTokenRepository.deleteByToken(token);
            throw new IllegalArgumentException("Token expired, please request a new one.");
        }

        String username = ottToken.getUser().getName();
        String jwt = jwtService.generateToken(username);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(username);

        ottTokenRepository.save(ottToken);

        return ResponseEntity.ok(JwtResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .build());
    }
}