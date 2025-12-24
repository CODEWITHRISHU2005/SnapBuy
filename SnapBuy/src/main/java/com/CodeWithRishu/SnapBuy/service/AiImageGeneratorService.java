package com.CodeWithRishu.SnapBuy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiImageGeneratorService {

//    private final ImageModel imageModel;
//
//    public byte[] generateImage(String imagePrompt) {
//
//        OpenAiImageOptions options = OpenAiImageOptions.builder()
//                .N(1)
//                .width(1024)
//                .height(1024)
//                .quality("standard")
//                .responseFormat("url")
//                .model("dall-e-3")
//                .build();
//
//        ImageResponse response = imageModel.call(new ImagePrompt(imagePrompt, options));
//        String imageUrl = response.getResult().getOutput().getUrl();
//
//        try {
//            return new URL(imageUrl).openStream().readAllBytes();
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//    }

}