package com.CodeWithRishu.SnapBuy.config;

import com.CodeWithRishu.SnapBuy.dto.AWSSecret;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse;
import software.amazon.awssdk.services.secretsmanager.model.SecretsManagerException;

import javax.sql.DataSource;
import java.io.IOException;

@Configuration
@EnableConfigurationProperties(AWSSecret.class)
public class SecretConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecretConfig.class);

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;
    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;
    @Value("${spring.cloud.aws.secretsmanager.name}")
    private String secretName;


    @Bean
    public SecretsManagerClient secretsManagerClient(@Value("${cloud.aws.region.static}") String region) {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        return SecretsManagerClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }


    @Bean
    public AWSSecret awsSecret(SecretsManagerClient secretsManagerClient) {
        GetSecretValueRequest getSecretValueRequest = GetSecretValueRequest.builder()
                .secretId(secretName)
                .build();

        try {
            GetSecretValueResponse getSecretValueResponse = secretsManagerClient.getSecretValue(getSecretValueRequest);
            String secretString = getSecretValueResponse.secretString();

            if (secretString == null) {
                throw new IllegalStateException("Secret string retrieved from AWS Secrets Manager is null.");
            }

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(secretString, AWSSecret.class);

        } catch (SecretsManagerException e) {
            logger.error("Error retrieving secret '{}' from AWS Secrets Manager: {}", secretName, e.getMessage());
            throw new RuntimeException("Failed to retrieve database secrets from AWS Secrets Manager.", e);
        } catch (IOException e) {
            logger.error("Error parsing secret JSON from AWS Secrets Manager: {}", e.getMessage());
            throw new RuntimeException("Failed to parse database secrets JSON.", e);
        }
    }

    @Bean
    public DataSource dataSource(AWSSecret secrets) {
        logger.info("Configuring DataSource with secrets from AWS Secrets Manager.");

        return DataSourceBuilder.create()
                .url("jdbc:" + secrets.getEngine() + "://" + secrets.getHost() + ":" + secrets.getPort() + "/" + secrets.getDbname())
                .username(secrets.getUsername())
                .password(secrets.getPassword())
                .build();
    }
}