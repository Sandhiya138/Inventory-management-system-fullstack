package com.inventory.management.controller;

import com.inventory.management.dto.AnnouncementRequest;
import com.inventory.management.dto.ApiResponse;
import com.inventory.management.model.Announcement;
import com.inventory.management.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAllAnnouncements() {
        List<Announcement> announcements = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(ApiResponse.success(announcements));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(@Valid @RequestBody AnnouncementRequest request) {
        Announcement announcement = announcementService.createAnnouncement(request);
        return new ResponseEntity<>(ApiResponse.success("Announcement created successfully", announcement), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<Announcement>> markAsRead(@PathVariable Long id) {
        Announcement announcement = announcementService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement marked as read", announcement));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted successfully", null));
    }
}
