package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.Entity.Product;
import com.CodeWithRishu.SnapBuy.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProduct() {
        List<Product> products = productRepository.findAll();
        log.info("Fetched {} products", products.size());
        return products;
    }

    public Product getProductByIdOrThrow(int id) {
        return productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product not found with id: {}", id);
                    return new IllegalArgumentException("Product not found with id: " + id);
                });
    }

    public Product addProduct(Product product, List<MultipartFile> image) throws IOException {
        log.info("Adding new product: {}", product.getName());
        MultipartFile imageFile = image.getFirst();
        if (!image.isEmpty()) {
            product.setImageData(imageFile.getBytes());
            product.setImageType(imageFile.getContentType());
            log.debug("Set image data for product: {}", product.getName());
        }
        product.setProductAvailable(true);
        product.setStockQuantity(100);
        product.setReleaseDate(new java.util.Date());
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setProductAvailable(true);

        Product savedProduct = productRepository.save(product);
        log.info("Product '{}' added with id {}", savedProduct.getName(), savedProduct.getId());
        return savedProduct;
    }

    public Product updateProductOrThrow(int id, Product product, List<MultipartFile> imageFile) throws IOException {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product not found with id: {}", id);
                    return new IllegalArgumentException("Product not found with id: " + id);
                });

        log.info("Updating product with id: {}", id);
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setReleaseDate(product.getReleaseDate());
        existingProduct.setStockQuantity(product.getStockQuantity());
        existingProduct.setProductAvailable(product.isProductAvailable());

        if (imageFile != null && !imageFile.isEmpty()) {
            MultipartFile imageFiles = imageFile.getFirst();
            existingProduct.setImageData(imageFiles.getBytes());
            existingProduct.setImageType(imageFiles.getContentType());
            existingProduct.setImageName(imageFiles.getOriginalFilename());
            log.debug("Updated image for product id: {}", id);
        }

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Product with id {} updated successfully", id);
        return updatedProduct;
    }

    public void deleteProductOrThrow(int id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product not found with id: {}", id);
                    return new IllegalArgumentException("Product not found with id: " + id);
                });
        productRepository.delete(product);
        log.info("Product with id {} deleted successfully", id);
    }

    public List<Product> searchProducts(String keyword) {
        List<Product> products = productRepository.searchProducts(keyword);
        log.info("Searched products with keyword '{}', found {}", keyword, products.size());
        return products;
    }
}