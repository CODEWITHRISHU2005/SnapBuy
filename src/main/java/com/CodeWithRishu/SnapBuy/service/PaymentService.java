package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.request.StripeRequest;
import com.CodeWithRishu.SnapBuy.dto.response.StripeResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final String stripeSecretKey;
    private final String stripeSuccessUrl;
    private final String stripeCancelUrl;

    public StripeResponse createOrderByStripe(StripeRequest stripeRequest) throws StripeException {
        log.info("Creating Stripe session with amount: {} and currency: {}", stripeRequest.getAmount(), stripeRequest.getCurrency());

        SessionCreateParams.LineItem.PriceData.ProductData productData =
                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName(stripeRequest.getProductName())
                        .build();

        SessionCreateParams.LineItem.PriceData priceData =
                SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(stripeRequest.getCurrency() != null ? stripeRequest.getCurrency() : "USD")
                        .setUnitAmount(stripeRequest.getAmount())
                        .setProductData(productData)
                        .build();

        SessionCreateParams.LineItem lineItem =
                SessionCreateParams.LineItem.builder()
                        .setQuantity(stripeRequest.getQuantity())
                        .setPriceData(priceData)
                        .build();

        SessionCreateParams params =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl(stripeSuccessUrl)
                        .setCancelUrl(stripeCancelUrl)
                        .addLineItem(lineItem)
                        .build();

        try {
            Session session = Session.create(params);
            log.info("Stripe session created successfully: {}", session.getId());
            return StripeResponse.builder()
                    .status("SUCCESS")
                    .message("Payment session created")
                    .sessionId(session.getId())
                    .sessionUrl(session.getUrl())
                    .build();
        } catch (StripeException e) {
            log.error("Error creating Stripe session: {}", e.getMessage(), e);
            throw e;
        }
    }
}
