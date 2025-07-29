package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.Entity.OttToken;
import com.CodeWithRishu.SnapBuy.Entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.repository.OttTokenRepository;
import com.CodeWithRishu.SnapBuy.service.JwtService;
import com.CodeWithRishu.SnapBuy.service.OttService;
import com.CodeWithRishu.SnapBuy.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/ott")
public class OttController {

    private final OttService ottService;

    @Autowired
    public OttController(OttService ottService) {
        this.ottService = ottService;
    }

    @PostMapping("/sent")
    public ResponseEntity<String> sendOtt(@RequestParam String username) {
        ottService.generateMagicLink(username);
        return ResponseEntity.ok("Magic link sent to your email. Please check your inbox.");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> loginWithOtt(@RequestParam String token) {
        JwtResponse response = ottService.loginWithOttToken(token);
        return ResponseEntity.ok(response);
    }
}