package com.frontdash.backend.dto;

public class CreateOrderResponse {
    private final int orderNumber;
    private final double subtotal;
    private final double serviceCharge;
    private final double tipAmount;
    private final double grandTotal;
    private final String message;

    public CreateOrderResponse(int orderNumber, double subtotal, double serviceCharge, double tipAmount, double grandTotal, String message) {
        this.orderNumber = orderNumber;
        this.subtotal = subtotal;
        this.serviceCharge = serviceCharge;
        this.tipAmount = tipAmount;
        this.grandTotal = grandTotal;
        this.message = message;
    }

    public int getOrderNumber() {
        return orderNumber;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public double getServiceCharge() {
        return serviceCharge;
    }

    public double getTipAmount() {
        return tipAmount;
    }

    public double getGrandTotal() {
        return grandTotal;
    }

    public String getMessage() {
        return message;
    }
}
