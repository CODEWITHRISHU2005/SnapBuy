package com.CodeWithRishu.SnapBuy.dto.response;

import lombok.Data;

@Data
public class AddressDto {
    private Long id;
    private String street;
    private String city;
    private String state;
    private String pinCode;
    private String country;
}
