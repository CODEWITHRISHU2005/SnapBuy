package com.CodeWithRishu.SnapBuy.service;

import com.CodeWithRishu.SnapBuy.model.Product;
import com.CodeWithRishu.SnapBuy.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProduct() {
        List<Product> products = productRepository.findAll();
        System.out.println("Fetched products: " + products);
        return products;
    }

    public Product getProductsById(int id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product addProduct(Product product, List<MultipartFile> image) throws IOException {
        MultipartFile imageFile = image.getFirst();
        if (!image.isEmpty()) {
            product.setImageData(imageFile.getBytes());
            product.setImageType(imageFile.getContentType());
        }
        product.setProductAvailable(true);
        product.setStockQuantity(100);
        product.setReleaseDate(new java.util.Date());
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setProductAvailable(true);

        return productRepository.save(product);
    }

    public Product updateProduct(int id, Product product, List<MultipartFile> imageFile) throws IOException {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null) {
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
            }

            return productRepository.save(existingProduct);
        }

        return null;
    }

    public void deleteProduct(int id) {
        productRepository.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword);
    }
}