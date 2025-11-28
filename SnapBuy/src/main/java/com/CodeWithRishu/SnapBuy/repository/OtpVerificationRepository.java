package com.CodeWithRishu.SnapBuy.repository;

import com.CodeWithRishu.SnapBuy.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(String phone);

    Optional<OtpVerification> findTopByPhoneAndVerifiedTrueOrderByCreatedAtDesc(String phone);

    void deleteByPhoneAndVerifiedFalse(String phone);

    int deleteByExpiresAtBefore(Instant now);
}