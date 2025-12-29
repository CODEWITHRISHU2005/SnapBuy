package com.CodeWithRishu.SnapBuy.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.google.genai.GoogleGenAiEmbeddingConnectionDetails;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingOptions;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.redis.RedisVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.DefaultJedisClientConfig;
import redis.clients.jedis.HostAndPort;
import redis.clients.jedis.JedisPooled;

import java.net.URI;
import java.util.Optional;

@Configuration
public class VectorStoreConfig {

    @Bean
    public JedisPooled jedisPooled(@Value("${spring.data.redis.url}") String redisUrl) {
        return Optional.ofNullable(redisUrl)
                .map(URI::create)
                .map(uri -> {
                    int port = uri.getPort() != -1 ? uri.getPort() : 6379;

                    DefaultJedisClientConfig config = Optional.ofNullable(uri.getUserInfo())
                            .filter(info -> !info.isEmpty())
                            .map(info -> info.contains(":") ? info.split(":", 2)[1] : info)
                            .map(password -> DefaultJedisClientConfig.builder()
                                    .password(password)
                                    .ssl("rediss".equals(uri.getScheme()))
                                    .build())
                            .orElseGet(() -> DefaultJedisClientConfig.builder()
                                    .ssl("rediss".equals(uri.getScheme()))
                                    .build());

                    return new JedisPooled(new HostAndPort(uri.getHost(), port), config);
                })
                .orElseThrow(() -> new RuntimeException("Redis URL cannot be null"));
    }

    @Bean
    public EmbeddingModel embeddingModel(@Value("${spring.ai.google.genai.embedding.api-key}") String apiKey) {
        return new GoogleGenAiTextEmbeddingModel(
                GoogleGenAiEmbeddingConnectionDetails.builder().apiKey(apiKey).build(),
                GoogleGenAiTextEmbeddingOptions.builder()
                        .model("text-embedding-004")
                        .taskType(GoogleGenAiTextEmbeddingOptions.TaskType.RETRIEVAL_DOCUMENT)
                        .build()
        );
    }

    @Bean
    public VectorStore vectorStore(JedisPooled jedisPooled, EmbeddingModel embeddingModel) {
        return RedisVectorStore.builder(jedisPooled, embeddingModel)
                .indexName("snapbuy-vector-index")
                .prefix("product:")
                .initializeSchema(true)
                .build();
    }
    
}