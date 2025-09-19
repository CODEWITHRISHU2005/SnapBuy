package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/ask")
    public ResponseEntity<String> askBot(@RequestParam String message){

        String response = chatService.getResponse(message);
        return ResponseEntity.ok(response);
    }

}