package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public String extractUsername(String token) {
        log.debug("Extracting username from token");
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        log.debug("Extracting expiration from token");
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        log.debug("Extracting all claims from token");
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        boolean expired = extractExpiration(token).before(new Date());
        log.debug("Token expired: {}", expired);
        return expired;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean valid = (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        log.info("Validating token for user '{}': {}", username, valid);
        return valid;
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("roles", user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList()));
        claims.put("userId", user.getId());
        claims.put("name", user.getName());
        claims.put("email", user.getEmail());

        String token = createToken(claims, user.getEmail());

        log.info("Generated JWT for user '{}', roles={}, expires at {}",
                user.getEmail(), user.getRoles(), extractExpiration(token));

        return token;
    }


    private String createToken(Map<String, Object> claims, String email) {
        log.debug("Creating token for user '{}'", email);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 15)) // 15 days
                .signWith(getSignKey(), SignatureAlgorithm.HS512).compact();
    }

    private Key getSignKey() {
        log.debug("Getting signing key");
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}