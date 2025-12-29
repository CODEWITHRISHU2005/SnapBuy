package com.CodeWithRishu.SnapBuy.config;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Value("${spring.data.redis.url}")
    private String redisUrl;

    @Bean
    @Primary
    public LettuceConnectionFactory redisConnectionFactory() {
        return Optional.ofNullable(redisUrl)
                .map(URI::create)
                .map(uri -> {
                    RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
                    config.setHostName(uri.getHost());
                    config.setPort(uri.getPort() != -1 ? uri.getPort() : 6379);

                    Optional.ofNullable(uri.getUserInfo())
                            .filter(info -> !info.isEmpty())
                            .map(info -> info.contains(":") ? info.split(":", 2)[1] : info)
                            .ifPresent(config::setPassword);

                    LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder =
                            LettuceClientConfiguration.builder()
                                    .clientOptions(ClientOptions.builder()
                                            .socketOptions(SocketOptions.builder()
                                                    .connectTimeout(Duration.ofSeconds(30))
                                                    .keepAlive(true)
                                                    .build())
                                            .autoReconnect(true)
                                            .build())
                                    .commandTimeout(Duration.ofSeconds(30));

                    if ("rediss".equals(uri.getScheme())) {
                        clientConfigBuilder.useSsl().disablePeerVerification();
                    }

                    LettuceClientConfiguration clientConfig = clientConfigBuilder.build();

                    LettuceConnectionFactory factory = new LettuceConnectionFactory(config, clientConfig);
                    factory.afterPropertiesSet();
                    return factory;
                })
                .orElseThrow(() -> new IllegalStateException("Redis URL cannot be null"));
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .prefixCacheNameWith("snapbuy::")
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(createJsonSerializer()));

        return RedisCacheManager.builder(RedisCacheWriter.nonLockingRedisCacheWriter(connectionFactory))
                .cacheDefaults(cacheConfig)
                .transactionAware()
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        GenericJackson2JsonRedisSerializer serializer = createJsonSerializer();
        StringRedisSerializer stringSerializer = new StringRedisSerializer();

        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(serializer);

        return template;
    }

    private GenericJackson2JsonRedisSerializer createJsonSerializer() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.addMixIn(PageImpl.class, PageImplMixin.class);
        mapper.registerModule(new JavaTimeModule());
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return new GenericJackson2JsonRedisSerializer(mapper);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static abstract class PageImplMixin {
        @JsonCreator
        public PageImplMixin(
                @JsonProperty("content") List<?> content,
                @JsonProperty("pageable") Object pageable,
                @JsonProperty("totalElements") long totalElements) {
        }
    }

}