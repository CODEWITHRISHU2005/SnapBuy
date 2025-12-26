package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.request.OtpRequest;
import com.CodeWithRishu.SnapBuy.dto.response.OtpResponse;
import com.CodeWithRishu.SnapBuy.entity.OtpVerification;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.OtpVerificationRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.function.Function;
import java.util.stream.IntStream;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final UserRepository userRepository;

    @Value("${twilio.account-sid}")
    private String accountSid;
    @Value("${twilio.auth-token}")
    private String authToken;
    @Value("${twilio.phone-number}")
    private String fromPhoneNumber;
    @Value("${app.otp.expiration-ms:300000}")
    private long otpExpiration;
    @Value("${app.otp.length}")
    private int otpLength;

    private void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    @Transactional
    public OtpResponse sendOtp(OtpRequest otpRequest) {
        log.info("Sending OTP to phone: {}", maskPhone(otpRequest.phone()));

        return Optional.of(normalizePhone(otpRequest.phone()))
                .map(phone -> {
                    cleanupExpiredOtps();
                    String otp = generateOtp();
                    Instant expiresAt = Instant.now().plusMillis(otpExpiration);

                    otpRepository.save(OtpVerification.builder()
                            .phone(phone)
                            .otp(otp)
                            .verified(false)
                            .expiresAt(expiresAt)
                            .build());

                    return sendSms(phone, otp)
                            ? new OtpResponse(true, "OTP sent successfully", expiresAt)
                            : new OtpResponse(false, "Failed to send OTP", null);
                })
                .orElseGet(() -> new OtpResponse(false, "Error processing request", null));
    }

    @Transactional
    public OtpResponse verifyOtp(OtpRequest otpVerifyRequest) {
        String phone = normalizePhone(otpVerifyRequest.phone());
        log.info("Verifying OTP for phone: {}", maskPhone(phone));

        User user = userRepository.findByEmail(otpVerifyRequest.email())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + otpVerifyRequest.email()));

        return otpRepository.findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(phone)
                .map(verification -> {
                    if (verification.getExpiresAt().isBefore(Instant.now())) {
                        return new OtpResponse(false, "OTP has expired", null);
                    }
                    if (!verification.getOtp().equals(otpVerifyRequest.otp())) {
                        return new OtpResponse(false, "Invalid OTP", null);
                    }

                    verification.setVerified(true);
                    verification.setUser(user);
                    otpRepository.save(verification);
                    return new OtpResponse(true, "Verified successfully!", verification.getExpiresAt());
                })
                .orElse(new OtpResponse(false, "No OTP found", null));
    }

    public boolean isPhoneVerified(String phone) {
        return otpRepository.findTopByPhoneAndVerifiedTrueOrderByCreatedAtDesc(normalizePhone(phone))
                .isPresent();
    }

    public OtpResponse resendOtp(OtpRequest otpRequest) {
        otpRepository.deleteByPhoneAndVerifiedFalse(normalizePhone(otpRequest.phone()));
        return sendOtp(otpRequest);
    }

    private String generateOtp() {
        return IntStream.range(0, otpLength)
                .mapToObj(i -> String.valueOf(new Random().nextInt(10)))
                .reduce("", String::concat);
    }

    private boolean sendSms(String toPhone, String otp) {
        try {
            initTwilio();
            Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(fromPhoneNumber),
                    String.format("Your code: %s. Expires in %d min.", otp, (otpExpiration / 60000))
            ).create();
            return true;
        } catch (Exception e) {
            log.error("Twilio error", e);
            return false;
        }
    }

    private String normalizePhone(String phone) {
        return Optional.ofNullable(phone)
                .filter(p -> !p.startsWith("+91"))
                .map(p -> "+91" + p)
                .orElse(phone);
    }

    private String maskPhone(String phone) {
        return Optional.ofNullable(phone)
                .filter(p -> p.length() >= 4)
                .map(p -> "****" + p.substring(p.length() - 4))
                .orElse("****");
    }

    @Transactional
    public void cleanupExpiredOtps() {
        Optional.of(otpRepository.deleteByExpiresAtBefore(Instant.now()))
                .filter(count -> count > 0)
                .ifPresent(count -> log.info("Cleaned up {} expired OTPs", count));
    }

}