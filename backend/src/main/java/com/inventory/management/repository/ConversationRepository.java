package com.inventory.management.repository;

import com.inventory.management.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    @Query("SELECT c FROM Conversation c WHERE c.participantOne.id = :userId OR c.participantTwo.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findUserConversations(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participantOne.id = :user1Id AND c.participantTwo.id = :user2Id) OR " +
           "(c.participantOne.id = :user2Id AND c.participantTwo.id = :user1Id)")
    Optional<Conversation> findBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Conversation c SET c.relatedOrder = null WHERE c.relatedOrder.id = :orderId")
    void clearRelatedOrderReferences(@Param("orderId") Long orderId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Conversation c WHERE c.participantOne.id = :userId OR c.participantTwo.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
