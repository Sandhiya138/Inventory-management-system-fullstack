package com.inventory.management.service;

import com.inventory.management.dto.AnnouncementRequest;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.Announcement;
import com.inventory.management.model.NotificationType;
import com.inventory.management.model.Role;
import com.inventory.management.model.User;
import com.inventory.management.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<Announcement> getAllAnnouncements() {
        List<Announcement> all = announcementRepository.findAllByOrderByCreatedAtDesc();
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null || currentUser.getRole() == Role.ADMIN) {
                return all;
            }
            if (currentUser.getRole() == Role.STAFF) {
                return all.stream()
                        .filter(a -> a.getTargetAudience() == null || "ALL".equalsIgnoreCase(a.getTargetAudience()) || "STAFF".equalsIgnoreCase(a.getTargetAudience()))
                        .toList();
            }
            if (currentUser.getRole() == Role.VIEWER) {
                return all.stream()
                        .filter(a -> a.getTargetAudience() == null || "ALL".equalsIgnoreCase(a.getTargetAudience()) || "VIEWER".equalsIgnoreCase(a.getTargetAudience()))
                        .toList();
            }
        } catch (Exception ignored) {
        }
        return all;
    }

    @Transactional
    public Announcement createAnnouncement(AnnouncementRequest request) {
        User currentUser = authService.getCurrentUser();
        String audience = (request.getTargetAudience() != null && !request.getTargetAudience().isBlank())
                ? request.getTargetAudience().toUpperCase()
                : "ALL";

        Announcement announcement = new Announcement(
                request.getTitle(),
                request.getMessage(),
                request.getPriority(),
                currentUser,
                audience
        );

        Announcement savedAnnouncement = announcementRepository.save(announcement);

        // Notify Staff if target is ALL or STAFF
        if ("STAFF".equals(audience) || "ALL".equals(audience)) {
            notificationService.createNotification(
                    null,
                    Role.STAFF,
                    NotificationType.ADMIN_ANNOUNCEMENT,
                    "New Staff Notice: " + savedAnnouncement.getTitle(),
                    savedAnnouncement.getMessage(),
                    savedAnnouncement.getId()
            );
        }

        // Notify Viewers if target is ALL or VIEWER
        if ("VIEWER".equals(audience) || "ALL".equals(audience)) {
            notificationService.createNotification(
                    null,
                    Role.VIEWER,
                    NotificationType.ADMIN_ANNOUNCEMENT,
                    "Notice: " + savedAnnouncement.getTitle(),
                    savedAnnouncement.getMessage(),
                    savedAnnouncement.getId()
            );
        }

        return savedAnnouncement;
    }

    @Transactional
    public Announcement markAsRead(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));
        announcement.setIsRead(true);
        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));
        announcementRepository.delete(announcement);
    }
}
