package com.CodeWithRishu.SnapBuy.Entity;

import com.CodeWithRishu.SnapBuy.Entity.Address;
import com.CodeWithRishu.SnapBuy.Entity.OrderItem;
import com.CodeWithRishu.SnapBuy.dto.OrderStatus;
import com.CodeWithRishu.SnapBuy.Entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "my_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime placedAt;

    @Column(nullable = false)
    @Min(value = 0, message = "Total amount must be greater than or equal to 0")
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    private Address shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
}
