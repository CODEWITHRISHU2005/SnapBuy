package com.CodeWithRishu.SnapBuy.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final RetrievalAugmentationAdvisor ragAdvisor;
    private final MessageChatMemoryAdvisor memoryAdvisor;

    public ChatService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore) {
        var documentRetriever = VectorStoreDocumentRetriever.builder()
                .vectorStore(vectorStore)
                .topK(5)
                .similarityThreshold(0.5d)
                .build();

        this.ragAdvisor = RetrievalAugmentationAdvisor.builder()
                .documentRetriever(documentRetriever)
                .build();

        this.memoryAdvisor = MessageChatMemoryAdvisor.builder(
                MessageWindowChatMemory.builder().maxMessages(5).build()
        ).build();

        this.chatClient = chatClientBuilder
                .defaultAdvisors(ragAdvisor, memoryAdvisor)
                .build();
    }

    public String getResponse(String userQuery, String conversationId) {
        try {
            return chatClient.prompt()
                    .user(userQuery)
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .call()
                    .content();
        } catch (Exception e) {
            return "Bot Failed: " + e.getMessage();
        }
    }
}