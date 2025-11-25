package com.CodeWithRishu.SnapBuy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.SoftDelete;

import java.math.BigDecimal;

@Entity
@Builder
@SoftDelete
@Getter
@Setter
@Table(name = "order_item")
@AllArgsConstructor
@NoArgsConstructor
public class OrderItem extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Min(value = 0, message = "Quantity must be greater than or equal to 0")
    private int quantity;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    private BigDecimal totalPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
}