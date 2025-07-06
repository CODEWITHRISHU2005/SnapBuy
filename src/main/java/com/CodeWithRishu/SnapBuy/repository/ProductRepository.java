package com.CodeWithRishu.SnapBuy.repository;

import com.CodeWithRishu.SnapBuy.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p WHERE " +
            "p.name LIKE :keyword OR p.description LIKE :keyword OR " +
            "p.brand LIKE :keyword OR p.category LIKE :keyword")
    List<Product> searchProducts(String keyword);
}