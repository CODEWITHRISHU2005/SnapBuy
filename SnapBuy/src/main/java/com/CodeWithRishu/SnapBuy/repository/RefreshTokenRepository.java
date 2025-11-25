package com.CodeWithRishu.SnapBuy.repository;

import com.CodeWithRishu.SnapBuy.entity.RefreshToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserInfo(User user);
}