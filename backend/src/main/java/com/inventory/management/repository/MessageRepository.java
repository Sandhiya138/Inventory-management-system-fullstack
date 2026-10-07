package com.inventory.management.repository;

import com.inventory.management.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    long countByConversationIdAndIsReadFalseAndSenderIdNot(Long conversationId, Long currentUserId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Message m WHERE m.sender.id = :userId")
    void deleteBySenderId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Message m WHERE m.conversation.id IN (SELECT c.id FROM Conversation c WHERE c.participantOne.id = :userId OR c.participantTwo.id = :userId)")
    void deleteByParticipantUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
