package com.inventory.management.service;

import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.Notification;
import com.inventory.management.model.NotificationType;
import com.inventory.management.model.Role;
import com.inventory.management.model.User;
import com.inventory.management.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForCurrentUser() {
        User currentUser = authService.getCurrentUser();
        return notificationRepository.findForUserAndRole(currentUser.getId(), currentUser.getRole());
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsReadForCurrentUser() {
        User currentUser = authService.getCurrentUser();
        List<Notification> notifications = notificationRepository.findForUserAndRole(currentUser.getId(), currentUser.getRole());
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public Notification createNotification(User recipient, Role targetRole, NotificationType type,
                                           String title, String message, Long referenceId) {
        Notification notification = new Notification(recipient, targetRole, type, title, message, referenceId);
        return notificationRepository.save(notification);
    }
}
