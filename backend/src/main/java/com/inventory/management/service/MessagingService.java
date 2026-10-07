package com.inventory.management.service;

import com.inventory.management.dto.ConversationRequest;
import com.inventory.management.dto.MessageRequest;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.exception.UnauthorizedException;
import com.inventory.management.model.*;
import com.inventory.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessagingService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<Conversation> getUserConversations() {
        User currentUser = authService.getCurrentUser();
        return conversationRepository.findUserConversations(currentUser.getId());
    }

    @Transactional
    public Conversation createConversation(ConversationRequest request) {
        User currentUser = authService.getCurrentUser();

        User participantTwo = userRepository.findById(request.getParticipantTwoId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getParticipantTwoId()));

        if (currentUser.getId().equals(participantTwo.getId())) {
            throw new BadRequestException("You cannot start a conversation with yourself");
        }

        // Validate allowed communication: ADMIN <-> STAFF, STAFF <-> VIEWER
        validateCommunicationRule(currentUser, participantTwo);

        // Check if existing conversation exists
        Conversation conversation = conversationRepository.findBetweenUsers(currentUser.getId(), participantTwo.getId())
                .orElse(null);

        if (conversation == null) {
            Order relatedOrder = null;
            if (request.getRelatedOrderId() != null) {
                relatedOrder = orderRepository.findById(request.getRelatedOrderId()).orElse(null);
            }

            String title = request.getTitle();
            if (title == null || title.trim().isEmpty()) {
                title = "Conversation: " + currentUser.getFullName() + " & " + participantTwo.getFullName();
            }

            ConversationType type = request.getType();
            if (type == null) {
                if ((currentUser.getRole() == Role.ADMIN && participantTwo.getRole() == Role.STAFF) ||
                    (currentUser.getRole() == Role.STAFF && participantTwo.getRole() == Role.ADMIN)) {
                    type = ConversationType.ADMIN_STAFF;
                } else if ((currentUser.getRole() == Role.STAFF && participantTwo.getRole() == Role.VIEWER) ||
                           (currentUser.getRole() == Role.VIEWER && participantTwo.getRole() == Role.STAFF)) {
                    type = ConversationType.STAFF_VIEWER;
                } else {
                    type = ConversationType.GENERAL;
                }
            }

            conversation = new Conversation(title, type, currentUser, participantTwo, relatedOrder);
            conversation = conversationRepository.save(conversation);
        }

        if (request.getInitialMessage() != null && !request.getInitialMessage().trim().isEmpty()) {
            Message message = new Message(conversation, currentUser, request.getInitialMessage().trim());
            messageRepository.save(message);
            conversation.setUpdatedAt(LocalDateTime.now());
            conversation = conversationRepository.save(conversation);

            // Notify participantTwo
            notificationService.createNotification(
                    participantTwo,
                    null,
                    NotificationType.NEW_MESSAGE,
                    "New message from " + currentUser.getFullName(),
                    request.getInitialMessage(),
                    conversation.getId()
            );
        }

        return conversation;
    }

    @Transactional
    public List<Message> getMessages(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        User currentUser = authService.getCurrentUser();
        boolean isParticipant = conversation.getParticipantOne().getId().equals(currentUser.getId()) ||
                                conversation.getParticipantTwo().getId().equals(currentUser.getId());

        if (!isParticipant && currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to view messages in this conversation");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark unread messages sent to current user as read
        for (Message msg : messages) {
            if (!msg.getSender().getId().equals(currentUser.getId()) && !Boolean.TRUE.equals(msg.getIsRead())) {
                msg.setIsRead(true);
            }
        }
        messageRepository.saveAll(messages);

        return messages;
    }

    @Transactional
    public Message sendMessage(Long conversationId, MessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        User currentUser = authService.getCurrentUser();
        boolean isParticipant = conversation.getParticipantOne().getId().equals(currentUser.getId()) ||
                                conversation.getParticipantTwo().getId().equals(currentUser.getId());

        if (!isParticipant) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }

        User recipient = conversation.getParticipantOne().getId().equals(currentUser.getId())
                ? conversation.getParticipantTwo()
                : conversation.getParticipantOne();

        Message message = new Message(conversation, currentUser, request.getContent());
        Message savedMessage = messageRepository.save(message);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Notify recipient
        notificationService.createNotification(
                recipient,
                null,
                NotificationType.NEW_MESSAGE,
                "New message from " + currentUser.getFullName(),
                request.getContent(),
                conversation.getId()
        );

        return savedMessage;
    }

    private void validateCommunicationRule(User u1, User u2) {
        Role r1 = u1.getRole();
        Role r2 = u2.getRole();

        boolean allowed = false;

        // ADMIN <-> STAFF
        if ((r1 == Role.ADMIN && r2 == Role.STAFF) || (r1 == Role.STAFF && r2 == Role.ADMIN)) {
            allowed = true;
        }
        // STAFF <-> VIEWER
        else if ((r1 == Role.STAFF && r2 == Role.VIEWER) || (r1 == Role.VIEWER && r2 == Role.STAFF)) {
            allowed = true;
        }
        // ADMIN <-> ADMIN or STAFF <-> STAFF
        else if ((r1 == Role.ADMIN && r2 == Role.ADMIN) || (r1 == Role.STAFF && r2 == Role.STAFF)) {
            allowed = true;
        }

        if (!allowed) {
            throw new BadRequestException("Communication between " + r1 + " and " + r2 + " is not permitted by role policy. (Allowed: ADMIN ↔ STAFF, STAFF ↔ VIEWER)");
        }
    }
}
