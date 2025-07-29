package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.dto.request.StripeRequest;
import com.CodeWithRishu.SnapBuy.dto.response.StripeResponse;
import com.CodeWithRishu.SnapBuy.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<StripeResponse> initiateStripePayment(@RequestBody StripeRequest stripeRequest) throws StripeException {
        StripeResponse stripeResponse = paymentService.createOrderByStripe(stripeRequest);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(stripeResponse);
    }
}