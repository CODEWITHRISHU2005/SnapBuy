package com.CodeWithRishu.SnapBuy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigInteger;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    private String street;

    private String city;

    private String state;

    @Column(name = "pin_code")
    private int pinCode;

    private String country;

    @Column(name = "phone_number")
    private BigInteger phoneNumber;
}
