package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.request.OtpRequest;
import com.CodeWithRishu.SnapBuy.dto.response.OtpResponse;
import com.CodeWithRishu.SnapBuy.entity.OtpVerification;
import com.CodeWithRishu.SnapBuy.entity.User;
import com.CodeWithRishu.SnapBuy.repository.OtpVerificationRepository;
import com.CodeWithRishu.SnapBuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final UserRepository userRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String BREVO_SMS_URL = "https://api.brevo.com/v3/transactionalSMS/sms";

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender-name:SnapBuy}")
    private String senderName;

    @Value("${otp.expiration-ms}")
    private long otpExpiration;

    @Value("${otp.length}")
    private int otpLength;

    @Transactional
    public OtpResponse sendOtp(OtpRequest otpRequest) {
        String phone = normalizePhone(otpRequest.phone());
        log.info("Sending OTP to phone: {}", maskPhone(phone));

        String otp = generateOtp();
        Instant expiresAt = Instant.now().plusMillis(otpExpiration);

        otpRepository.save(OtpVerification.builder()
                .phone(phone)
                .otp(otp)
                .verified(false)
                .expiresAt(expiresAt)
                .build());

        boolean isSent = sendSms(phone, otp);

        if (isSent) {
            return new OtpResponse(true, "OTP sent successfully", expiresAt);
        } else {
            return new OtpResponse(false, "Failed to send OTP via Brevo", null);
        }
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
                .orElse(new OtpResponse(false, "No active OTP found", null));
    }

    public boolean isPhoneVerified(String phone) {
        return otpRepository.findTopByPhoneAndVerifiedTrueOrderByCreatedAtDesc(normalizePhone(phone))
                .isPresent();
    }

    @Transactional
    public OtpResponse resendOtp(OtpRequest otpRequest) {
        otpRepository.deleteByPhoneAndVerifiedFalse(normalizePhone(otpRequest.phone()));
        return sendOtp(otpRequest);
    }

    private String generateOtp() {
        StringBuilder otp = new StringBuilder(otpLength);
        for (int i = 0; i < otpLength; i++) {
            otp.append(SECURE_RANDOM.nextInt(10));
        }
        return otp.toString();
    }

    private boolean sendSms(String toPhone, String otp) {
        try {
            long minutes = otpExpiration / 60000;
            String messageContent = buildHtmlOtpEmail(toPhone, otp, minutes);

            String jsonRequestBody = String.format(
                    "{\"type\":\"transactional\",\"sender\":\"%s\",\"recipient\":\"%s\",\"content\":\"%s\"}",
                    senderName, toPhone, messageContent
            );

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_SMS_URL))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            int statusCode = response.statusCode();
            if (statusCode >= 200 && statusCode < 300) {
                return true;
            } else {
                log.error("Brevo API error. Status: {}, Response: {}", statusCode, response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to execute native HttpClient request to Brevo for phone: {}", maskPhone(toPhone), e);
            return false;
        }
    }

    private String normalizePhone(String phone) {
        if (phone == null) return null;
        return phone.startsWith("+91") ? phone : "+91" + phone;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "****" + phone.substring(phone.length() - 4);
    }

    @Scheduled(fixedRateString = "${otp.cleanup-rate-ms}")
    @Transactional
    public void cleanupExpiredOtp() {
        int count = otpRepository.deleteByExpiresAtBefore(Instant.now());
        if (count > 0) {
            log.info("Scheduled task cleaned up {} expired OTP records", count);
        }
    }

    private String buildHtmlOtpEmail(String username, String otp, long minutes) {
        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937;">
            
            <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        
                        <table width="100%%" max-width="600px" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                            
                            <tr>
                                <td align="center" style="background-color: #2563eb; padding: 30px 20px;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">SnapBuy</h1>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Hi %s,</h2>
                                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                                        Here is your one-time verification code to securely access your <strong>SnapBuy</strong> account.
                                    </p>
                                    
                                    <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td align="center" style="padding: 10px 0 20px 0;">
                                                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px 40px; display: inline-block;">
                                                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; color: #1e293b; letter-spacing: 12px;">%s</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-top: 16px; margin-bottom: 16px;">
                                        <em>This code will expire in <strong>%d minutes</strong>.</em>
                                    </p>
                                    <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 0;">
                                        If you did not request this code, please safely ignore this email. <strong>Never share this code with anyone.</strong>
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 30px; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                        &copy; 2024 SnapBuy. All rights reserved.<br>
                                        This is an automated message. Please do not reply.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """, username, otp, minutes);
    }
}