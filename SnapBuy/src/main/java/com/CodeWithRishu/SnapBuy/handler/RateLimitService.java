package com.CodeWithRishu.SnapBuy.handler;

import com.CodeWithRishu.SnapBuy.config.RateLimitProp;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RateLimitProp prop;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final Map<String, Integer> limits = new LinkedHashMap<>();

    @PostConstruct
    public void init() {
        limits.put("/api/auth/signIn", prop.getLogin());
        limits.put("/api/auth/signUp", prop.getRegister());
        limits.put("/api/otp", prop.getOtp());
        limits.put("/api/ott", prop.getOtt());
        limits.put("/api/chat", prop.getChat());
        limits.put("/api/orders", prop.getOrders());
        limits.put("/api/products", prop.getProducts());
    }

    public Bucket resolveBucket(String key, String path) {
        return buckets.computeIfAbsent(
                key + ":" + path,
                k -> createBucket(path)
        );
    }

    private Bucket createBucket(String path) {

        int capacity = limits.entrySet()
                .stream()
                .filter(entry -> path.startsWith(entry.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(prop.getProducts());

        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(capacity)
                        .refillGreedy(
                                capacity,
                                Duration.ofMinutes(prop.getDuration()))
                        .build())
                .build();
    }

}