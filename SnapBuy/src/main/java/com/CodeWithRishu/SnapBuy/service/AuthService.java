package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.Role;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.exception.UserAlreadyExists;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public void register(User userInfo) {
        log.info("Attempting to register user: {}", userInfo.getEmail());

        repository.findByEmail(userInfo.getEmail())
                .ifPresent(u -> {
                    throw new UserAlreadyExists("User already exists with email: " + userInfo.getEmail());
                });

        repository.save(prepareUser(userInfo));

        log.info("User '{}' added successfully", userInfo.getEmail());
    }

    private User prepareUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Role assignedRole = Optional.ofNullable(user.getAdminKey())
                .filter(key -> key.equals("Rishabh@2005"))
                .map(key -> Role.ADMIN)
                .orElse(Role.USER);

        user.setRoles(Set.of(assignedRole));
        user.setAdminKey(null);

        log.info("User '{}' assigned role: {}", user.getEmail(), assignedRole);
        return user;
    }
}