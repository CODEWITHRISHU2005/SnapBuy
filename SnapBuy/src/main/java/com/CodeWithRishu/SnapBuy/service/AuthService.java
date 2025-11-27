package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.Role;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.exception.UserAlreadyExists;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public void register(User userInfo) {
        log.info("Adding new user: {}", userInfo.getEmail());
        if (repository.findByEmail(userInfo.getEmail()).isPresent()) {
            throw new UserAlreadyExists("User already exists with email: " + userInfo.getEmail());
        }

        userInfo.setPassword(passwordEncoder.encode(userInfo.getPassword()));

        if (userInfo.getAdminKey() != null &&
                userInfo.getAdminKey().equals("Rishabh@2005")) {
            userInfo.setRoles(Set.of(Role.ADMIN));
            log.info("User '{}' registered as ADMIN", userInfo.getEmail());
        } else {
            userInfo.setRoles(Set.of(Role.USER));
            log.info("User '{}' registered as USER", userInfo.getEmail());
        }

        userInfo.setAdminKey(null);

        repository.save(userInfo);
        log.info("User '{}' added successfully", userInfo.getEmail());
    }

    public void registerForGoogle(User user) {
        log.info("Adding new Google user: {}", user.getEmail());
        if (repository.findByEmail(user.getEmail()).isPresent()) {
            log.info("User already exists with email: {}", user.getEmail());
            return;
        }

        repository.save(user);
        log.info("Google user '{}' added successfully", user.getEmail());
    }
}
