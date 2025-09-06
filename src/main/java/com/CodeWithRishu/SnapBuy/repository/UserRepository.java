package com.CodeWithRishu.SnapBuy.repository;

import com.CodeWithRishu.SnapBuy.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByNameOrEmail(String username, String email);

    Optional<User> findByName(String username);

    Optional<User> findByEmail(String username);
}