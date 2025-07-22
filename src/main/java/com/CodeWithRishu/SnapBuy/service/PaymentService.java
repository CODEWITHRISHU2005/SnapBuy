package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.dto.request.RazorpayRequest;
import com.CodeWithRishu.SnapBuy.dto.request.StripeRequest;
import com.CodeWithRishu.SnapBuy.dto.response.RazorpayResponse;
import com.CodeWithRishu.SnapBuy.dto.response.StripeResponse;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class PaymentService {

    private final String stripeSecretKey;
    private final String razorpayKeyId;
    private final RazorpayClient razorpayClient;
    private final String stripeSuccessUrl;
    private final String stripeCancelUrl;

    public PaymentService(
            @Value("${stripe.secret.key}") String stripeSecretKey,
            @Value("${razorpay.key.id}") String razorpayKeyId,
            @Value("${stripe.success.url}") String stripeSuccessUrl,
            @Value("${stripe.cancel.url}") String stripeCancelUrl,
            RazorpayClient razorpayClient) {
        this.stripeSecretKey = stripeSecretKey;
        this.razorpayKeyId = razorpayKeyId;
        this.stripeSuccessUrl = stripeSuccessUrl;
        this.stripeCancelUrl = stripeCancelUrl;
        this.razorpayClient = razorpayClient;
    }

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

    public RazorpayResponse createOrderByRazorpay(RazorpayRequest razorpayRequest) throws RazorpayException {
        log.info("Creating Razorpay order with amount: {} and currency: {}", razorpayRequest.getAmount(), razorpayRequest.getCurrency());

        // Using a Map is great for building the options in a type-safe way.
        Map<String, Object> options = new HashMap<>();
        long amountInPaisa = razorpayRequest.getAmount() * 100; // Convert to paisa

        options.put("amount", amountInPaisa);
        options.put("currency", razorpayRequest.getCurrency() != null ? razorpayRequest.getCurrency() : "INR");
        options.put("receipt", razorpayRequest.getReceipt());
        options.put("payment_capture", 1); // Auto capture payment

        try {
            Order order = razorpayClient.orders.create(new JSONObject(options));

            String orderId = order.get("id");
            log.info("Razorpay order created successfully: {}", orderId);

            return RazorpayResponse.builder()
                    .status("SUCCESS")
                    .message("Order created successfully")
                    .orderId(orderId)
                    .razorpayKeyId(this.razorpayKeyId)
                    .amount(amountInPaisa)
                    .currency(order.get("currency"))
                    .build();
        } catch (RazorpayException e) {
            log.error("Error creating Razorpay order: {}", e.getMessage(), e);
            throw e;
        }
    }
}
