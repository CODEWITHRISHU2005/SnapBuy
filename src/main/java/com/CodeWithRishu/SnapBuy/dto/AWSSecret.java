package com.CodeWithRishu.SnapBuy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AWSSecret {
    @JsonProperty("username")
    private String username;
    @JsonProperty("password")
    private String password;
    @JsonProperty("engine")
    private String engine;
    @JsonProperty("host")
    private String host;
    @JsonProperty("port")
    private int port;
    @JsonProperty("dbInstanceIdentifier")
    private String dbInstanceIdentifier;
    @JsonProperty("dbname")
    private String dbname;
}