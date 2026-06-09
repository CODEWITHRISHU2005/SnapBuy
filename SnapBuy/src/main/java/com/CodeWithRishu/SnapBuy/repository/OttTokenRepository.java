package com.CodeWithRishu.SnapBuy.repository;

import com.CodeWithRishu.SnapBuy.entity.OttToken;
import com.CodeWithRishu.SnapBuy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OttTokenRepository extends JpaRepository<OttToken, Integer> {
    Optional<OttToken> findByToken(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM OttToken o WHERE o.user = :user")
    void deleteByUser(User user);

    int deleteByExpiryDateBefore(Instant now);
}