package com.frontdash.backend.controller;

import com.frontdash.backend.dto.HoursUpdateRequest;
import com.frontdash.backend.dto.MenuCreateRequest;
import com.frontdash.backend.dto.MenuUpdateRequest;
import com.frontdash.backend.dto.RestaurantRegistrationRequest;
import com.frontdash.backend.service.FrontdashService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/restaurant")
public class RestaurantController {

    private final FrontdashService service;

  public RestaurantController(FrontdashService service) {
    this.service = service;
  }

  @GetMapping("/menu")
  public java.util.List<java.util.Map<String, Object>> getMenu(@RequestParam("restName") String restName) {
    return service.getMenu(restName);
  }

  @GetMapping("/hours")
  public java.util.List<java.util.Map<String, Object>> getHours(@RequestParam("restName") String restName) {
    return service.getHours(restName);
  }

  @PostMapping("/registration")
  public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RestaurantRegistrationRequest request) {
    service.registerRestaurant(
            request.getRestName(),
            request.getStreetAddress1(),
                request.getStreetAddress2(),
                request.getCity(),
                request.getState(),
                request.getZip(),
                request.getContactName(),
                request.getContactEmail(),
                request.getContactPhone()
        );
        return ResponseEntity.ok(Map.of("message", "Registration submitted"));
    }

    @PostMapping("/withdrawal")
    public ResponseEntity<Map<String, String>> requestWithdrawal(@RequestParam("restName") String restName) {
        service.requestWithdrawal(restName);
        return ResponseEntity.ok(Map.of("message", "Withdrawal requested"));
    }

    @PutMapping("/menu-item")
  public ResponseEntity<Map<String, String>> updateMenu(@Valid @RequestBody MenuUpdateRequest request) {
    service.updateMenuItem(
            request.getRestName(),
            request.getItemId(),
            request.getItemName(),
            request.getItemDescription(),
            request.getItemPrice(),
            request.getIsAvailable()
    );
    return ResponseEntity.ok(Map.of("message", "Menu item updated"));
  }

  @PostMapping("/menu-item")
  public ResponseEntity<Map<String, Object>> createMenu(@Valid @RequestBody MenuCreateRequest request) {
    int itemId = service.createMenuItem(
            request.getRestName(),
            request.getItemName(),
            request.getItemDescription(),
            request.getItemPrice(),
            request.getIsAvailable()
    );
    return ResponseEntity.ok(Map.of("message", "Menu item created", "itemId", itemId));
  }

    @PutMapping("/hours")
    public ResponseEntity<Map<String, String>> updateHours(@Valid @RequestBody HoursUpdateRequest request) {
        service.updateHours(
                request.getRestName(),
                request.getDayOfWeek(),
                request.getOpenTime(),
                request.getCloseTime(),
                request.getIsClosed()
        );
        return ResponseEntity.ok(Map.of("message", "Hours updated"));
    }
}
