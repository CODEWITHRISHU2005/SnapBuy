package com.CodeWithRishu.SnapBuy.repository;

import com.CodeWithRishu.SnapBuy.Entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"items"})
    List<Order> findAllByUserId(int userId);
}