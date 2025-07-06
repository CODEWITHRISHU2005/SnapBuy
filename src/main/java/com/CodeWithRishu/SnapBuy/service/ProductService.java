package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.Entity.Product;
import com.CodeWithRishu.SnapBuy.exception.ResourceNotFoundException;
import com.CodeWithRishu.SnapBuy.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProduct() {
        log.info("Fetching all products");
        List<Product> products = productRepository.findAll();
        log.debug("Total products fetched: {}", products.size());
        return products;
    }

    public Product getProductByIdOrThrow(int id) {
        return productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product not found with id: {}", id);

                    return new ResourceNotFoundException("Product", "id", id);
                });
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        log.info("Adding new product: {}", product.getName());

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageData(imageFile.getBytes());
            product.setImageType(imageFile.getContentType());
            product.setImageName(StringUtils.cleanPath(Objects.requireNonNull(imageFile.getOriginalFilename())));
            log.debug("Set image data for product: {}", product.getName());
        }

        product.setProductAvailable(true);
        product.setStockQuantity(100);
        product.setReleaseDate(new Date());

        Product savedProduct = productRepository.save(product);
        log.info("Product '{}' added with id {}", savedProduct.getName(), savedProduct.getId());
        return savedProduct;
    }

    public Product updateProductOrThrow(int id, Product productDetails, MultipartFile imageFile) throws IOException {
        Product existingProduct = getProductByIdOrThrow(id);

        log.info("Updating product with id: {}", id);
        existingProduct.setName(productDetails.getName());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setBrand(productDetails.getBrand());
        existingProduct.setPrice(productDetails.getPrice());
        existingProduct.setCategory(productDetails.getCategory());
        existingProduct.setReleaseDate(productDetails.getReleaseDate());
        existingProduct.setStockQuantity(productDetails.getStockQuantity());
        existingProduct.setProductAvailable(productDetails.isProductAvailable());

        if (imageFile != null && !imageFile.isEmpty()) {
            existingProduct.setImageData(imageFile.getBytes());
            existingProduct.setImageType(imageFile.getContentType());
            existingProduct.setImageName(StringUtils.cleanPath(Objects.requireNonNull(imageFile.getOriginalFilename())));
            log.debug("Updated image for product id: {}", id);
        }

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Product with id {} updated successfully", id);
        return updatedProduct;
    }

    public void deleteProductOrThrow(int id) {
        Product product = getProductByIdOrThrow(id);
        productRepository.delete(product);
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
}