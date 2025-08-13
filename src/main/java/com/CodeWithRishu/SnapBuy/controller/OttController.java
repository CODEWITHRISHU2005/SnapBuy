package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.dto.response.JwtResponse;
import com.CodeWithRishu.SnapBuy.service.OttService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ott")
public class OttController {

    private final OttService ottService;

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