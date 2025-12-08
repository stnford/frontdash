package com.frontdash.backend.controller;

import com.frontdash.backend.dto.AssignDriverRequest;
import com.frontdash.backend.dto.CreateOrderRequest;
import com.frontdash.backend.dto.CreateOrderResponse;
import com.frontdash.backend.dto.DeliveryRequest;
import com.frontdash.backend.service.FrontdashService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final FrontdashService service;

    public OrderController(FrontdashService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(service.createOrder(request));
    }

    @PostMapping("/{orderNumber}/assign-driver")
    public ResponseEntity<Map<String, String>> assignDriver(
            @PathVariable int orderNumber,
            @Valid @RequestBody AssignDriverRequest request) {
        service.assignDriver(orderNumber, request.getDriverName());
        return ResponseEntity.ok(Map.of("message", "Driver assigned"));
    }

    @PostMapping("/{orderNumber}/delivery")
    public ResponseEntity<Map<String, String>> setDelivery(
            @PathVariable int orderNumber,
            @Valid @RequestBody DeliveryRequest request) {
        service.setDelivery(orderNumber, request.getDate(), request.getTime());
        return ResponseEntity.ok(Map.of("message", "Delivery marked"));
    }

    @GetMapping
    public List<Map<String, Object>> listOrders() {
        return service.listOrders();
    }

    @GetMapping("/{orderNumber}")
    public Map<String, Object> getOrderSummary(@PathVariable int orderNumber) {
        return service.getOrderSummary(orderNumber);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
