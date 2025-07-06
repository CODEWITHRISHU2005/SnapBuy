package com.CodeWithRishu.SnapBuy.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String product, String id, int id1) {
        super(String.format("%s with %s %d not found", product, id, id1));
    }
}