package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.entity.Product;
import com.CodeWithRishu.SnapBuy.exception.ResourceNotFoundException;
import com.CodeWithRishu.SnapBuy.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final AiImageGeneratorService aiImageGenService;
    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public ProductService(
            ProductRepository productRepository,
            AiImageGeneratorService aiImageGenService,
            ChatClient.Builder chatClientBuilder,
            VectorStore vectorStore) {
        this.productRepository = productRepository;
        this.aiImageGenService = aiImageGenService;
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }

    public List<Product> getAllProduct() {
        log.info("Fetching all products");
        List<Product> products = productRepository.findAll();
        log.debug("Total products fetched: {}", products.size());
        return products;
    }

    public Product getProductById(long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product not found with id: {}", id);
                    return new ResourceNotFoundException("Product not found with this id try another: ");
                });
    }

    public Product addOrUpdateProduct(Product product, MultipartFile image) throws IOException {

        Product.ProductBuilder builder = Product.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .brand(product.getBrand())
                .price(product.getPrice())
                .category(product.getCategory())
                .releaseDate(product.getReleaseDate())
                .productAvailable(product.isProductAvailable())
                .stockQuantity(product.getStockQuantity());

        if (image != null && !image.isEmpty()) {
            builder.imageName(image.getOriginalFilename())
                    .imageType(image.getContentType())
                    .imageData(image.getBytes());
        } else {
            builder.imageName(product.getImageName())
                    .imageType(product.getImageType())
                    .imageData(product.getImageData());
        }

        Product savedProduct = productRepository.save(builder.build());

        String content = String.format("""
                        Product Name: %s
                        Description: %s
                        Brand: %s
                        Category: %s
                        Price: %.2f
                        Release Date: %s
                        Available: %s
                        Stock: %s
                        """,
                savedProduct.getName(),
                savedProduct.getDescription(),
                savedProduct.getBrand(),
                savedProduct.getCategory(),
                savedProduct.getPrice(),
                savedProduct.getReleaseDate(),
                savedProduct.isProductAvailable(),
                savedProduct.getStockQuantity()
        );

        Document document = new Document(
                UUID.randomUUID().toString(),
                content,
                Map.of("productId", String.valueOf(savedProduct.getId()))
        );

        vectorStore.add(List.of(document));

        return savedProduct;
    }

    public void deleteProduct(long id) {
        productRepository.deleteById(id);
        log.info("Product with id {} deleted successfully", id);
    }

    public Page<Product> getProductsByPaginationAndSorting(int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching products with pagination: page={}, size={}, sortBy={}, sortDirection={}", page, size, sortBy, sortDirection);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.findAll(pageable);
        log.debug("Total products fetched: {}, Total pages: {}", productPage.getTotalElements(), productPage.getTotalPages());

        return productPage;
    }

    public List<Product> searchProducts(String keyword) {
        log.info("Searching products with keyword: {}", keyword);
        List<Product> products = productRepository.searchProducts(keyword);
        log.debug("Total products found: {}", products.size());
        return products;
    }

    public String generateDescription(String name, String category) {
        String descPrompt = String.format("""
                
                Write a concise and professional product description for an e-commerce listing.
                
                Product Name: %s
                Category: %s
                
                Keep it simple, engaging, and highlight its primary features or benefits.
                Avoid technical jargon and keep it customer-friendly.
                Limit the description to 250 characters maximum.
                
                """, name, category);

        return Objects.requireNonNull(chatClient.prompt(descPrompt)
                        .call()
                        .chatResponse())
                .getResult()
                .getOutput()
                .getText();
    }

    public byte[] generateImage(String name, String category, String description) {

        String imagePrompt = String.format("""
                Generate a highly realistic, professional-grade e-commerce product image.
                
                     Product Details:
                     - Category: %s
                     - Name: '%s'
                     - Description: %s
                
                     Requirements:
                     - Use a clean, minimalistic, white or very light grey background.
                     - Ensure the product is well-lit with soft, natural-looking lighting.
                     - Add realistic shadows and soft reflections to ground the product naturally.
                     - No humans, brand logos, watermarks, or text overlays should be visible.
                     - Showcase the product from its most flattering angle that highlights key features.
                     - Ensure the product occupies a prominent position in the frame, centered or slightly off-centered.
                     - Maintain a high resolution and sharpness, ensuring all textures, colors, and details are clear.
                     - Follow the typical visual style of top e-commerce websites like Amazon, Flipkart, or Shopify.
                     - Make the product appear life-like and professionally photographed in a studio setup.
                     - The final image should look immediately ready for use on an e-commerce website without further editing.
                """, category, name, description);

        return aiImageGenService.generateImage(imagePrompt);
    }

}