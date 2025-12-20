package com.CodeWithRishu.SnapBuy.controller;

import com.CodeWithRishu.SnapBuy.entity.Product;
import com.CodeWithRishu.SnapBuy.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProduct(), HttpStatus.OK);
    }

    @GetMapping("/pagination-sorting")
    public ResponseEntity<Page<Product>> getProductsByPaginationAndSorting(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        Page<Product> productPage = productService.getProductsByPaginationAndSorting(page, size, sortBy, sortDirection);

        return ResponseEntity.ok(productPage);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Product> getProductById(@PathVariable int id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/{id}/image")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<byte[]> getProductImage(@PathVariable int id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product.getImageData());
    }

    @PostMapping("/generate-description")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> generateDescription(@RequestParam String name, @RequestParam String category) {
        String aiDesc = productService.generateDescription(name, category);
        return new ResponseEntity<>(aiDesc, HttpStatus.OK);
    }

    @PostMapping("/generate-image")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> generateImage(@RequestParam String name, @RequestParam String category, @RequestParam String description) {
        byte[] aiImage = productService.generateImage(name, category, description);
        return new ResponseEntity<>(aiImage, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Product> addProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Product savedProduct = productService.addOrUpdateProduct(product, (MultipartFile) imageFile);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword){
        List<Product> products = productService.searchProducts(keyword);
        log.info("searching with {}", keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

}