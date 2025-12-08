package com.frontdash.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public class CreateOrderRequest {
    @NotBlank
    private String restName;

    @NotEmpty
    private List<OrderItem> items;

    @NotNull
    private DeliveryDetails delivery;

    private Double tipAmount;

    public String getRestName() { return restName; }
    public void setRestName(String restName) { this.restName = restName; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public DeliveryDetails getDelivery() { return delivery; }
    public void setDelivery(DeliveryDetails delivery) { this.delivery = delivery; }

    public Double getTipAmount() { return tipAmount; }
    public void setTipAmount(Double tipAmount) { this.tipAmount = tipAmount; }

    public static class OrderItem {
        @NotNull
        private Integer itemId;

        @Min(1)
        private int quantity;

        public Integer getItemId() { return itemId; }
        public void setItemId(Integer itemId) { this.itemId = itemId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class DeliveryDetails {
        @NotBlank
        private String streetAddress1;
        private String streetAddress2;
        @NotBlank
        private String city;
        @NotBlank
        private String state;
        private String zip;

        @NotBlank
        private String contactName;

        @NotBlank
        @Pattern(regexp = "^[0-9]{10}$", message = "Contact phone must be 10 digits")
        private String contactPhone;

        public String getStreetAddress1() { return streetAddress1; }
        public void setStreetAddress1(String streetAddress1) { this.streetAddress1 = streetAddress1; }

        public String getStreetAddress2() { return streetAddress2; }
        public void setStreetAddress2(String streetAddress2) { this.streetAddress2 = streetAddress2; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getZip() { return zip; }
        public void setZip(String zip) { this.zip = zip; }

        public String getContactName() { return contactName; }
        public void setContactName(String contactName) { this.contactName = contactName; }

        public String getContactPhone() { return contactPhone; }
        public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    }
}
