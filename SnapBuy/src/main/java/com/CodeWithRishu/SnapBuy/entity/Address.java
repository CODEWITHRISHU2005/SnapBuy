package com.CodeWithRishu.SnapBuy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

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
    private String pinCode;

    private String country;

    @Column(name = "phone_number")
    private String phoneNumber;

}