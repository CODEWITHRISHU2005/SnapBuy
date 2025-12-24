package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/ask")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<String> askBot(@RequestParam String message){

        String response = chatService.getResponse(message);
        return ResponseEntity.ok(response);
    }

}