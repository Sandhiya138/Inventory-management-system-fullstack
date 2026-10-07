package com.inventory.management.repository;

import com.inventory.management.model.Notification;
import com.inventory.management.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :userId OR (n.recipient IS NULL AND n.targetRole = :role) ORDER BY n.createdAt DESC")
    List<Notification> findForUserAndRole(@Param("userId") Long userId, @Param("role") Role role);

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findAllByOrderByCreatedAtDesc();

    long countByRecipientIdAndIsReadFalse(Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipient.id = :userId OR (n.recipient IS NULL AND n.targetRole = :role)) AND n.isRead = false")
    long countUnreadForUserAndRole(@Param("userId") Long userId, @Param("role") Role role);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :userId")
    void deleteByRecipientId(@Param("userId") Long userId);
}
