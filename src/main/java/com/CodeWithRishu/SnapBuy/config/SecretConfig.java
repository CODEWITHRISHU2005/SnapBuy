package com.CodeWithRishu.SnapBuy.config;

import com.CodeWithRishu.SnapBuy.dto.AWSSecret;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse;
import software.amazon.awssdk.services.secretsmanager.model.SecretsManagerException;

import javax.sql.DataSource;

@Configuration
@Profile("!local")
public class SecretConfig {

    @Bean
    public Gson gson() {
        return new Gson();
    }

    /**
     * Creates a singleton bean for the AWS Secrets Manager client.
     * This is more efficient than creating a new client on every call.
     * It relies on the DefaultAWSCredentialsProviderChain to find credentials
     * (e.g., from environment variables, EC2 instance profile), which is a best practice.
     */
    @Bean
    public SecretsManagerClient secretsManagerClient(@Value("${cloud.aws.region.static}") String region) {
        return SecretsManagerClient.builder()
                .region(Region.of(region))
                .build();
    }

    @Bean
    public AWSSecret awsSecret(
            SecretsManagerClient secretsManagerClient,
            Gson gson,
            @Value("${aws.secret.name}") String secretName
    ) {
        GetSecretValueRequest getSecretValueRequest = GetSecretValueRequest.builder()
                .secretId(secretName)
                .build();

        GetSecretValueResponse getSecretValueResponse;

        try {
            getSecretValueResponse = secretsManagerClient.getSecretValue(getSecretValueRequest);
        } catch (SecretsManagerException e) {
            throw new IllegalStateException("Error retrieving secret '" + secretName + "' from AWS Secrets Manager", e);
        }

        if (getSecretValueResponse == null || getSecretValueResponse.secretString() == null) {
            throw new IllegalStateException("Secret value is null for secret: " + secretName);
        }

        return gson.fromJson(getSecretValueResponse.secretString(), AWSSecret.class);
    }

    @Bean
    public DataSource dataSource(AWSSecret secrets) {
        return DataSourceBuilder
                .create()
                .url("jdbc:" + secrets.getEngine() + "://" + secrets.getHost() + ":" + secrets.getPort() + "/SnapBuy")
                .username(secrets.getUsername())
                .password(secrets.getPassword())
                .build();
    }
}