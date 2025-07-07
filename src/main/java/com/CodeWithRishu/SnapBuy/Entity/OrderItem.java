package com.CodeWithRishu.SnapBuy.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.SoftDelete;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@DynamicInsert
@DynamicUpdate
@SoftDelete
@Table(name = "order_item")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Min(value = 1, message = "Quantity must be greater than or equal to 1")
    private int quantity;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    private BigDecimal productPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
}