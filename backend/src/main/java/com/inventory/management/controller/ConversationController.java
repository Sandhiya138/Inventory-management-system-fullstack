package com.inventory.management.controller;

import com.inventory.management.dto.ApiResponse;
import com.inventory.management.dto.ConversationRequest;
import com.inventory.management.dto.MessageRequest;
import com.inventory.management.model.Conversation;
import com.inventory.management.model.Message;
import com.inventory.management.service.MessagingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private MessagingService messagingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Conversation>>> getUserConversations() {
        List<Conversation> conversations = messagingService.getUserConversations();
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<Conversation>> createConversation(@Valid @RequestBody ConversationRequest request) {
        Conversation conversation = messagingService.createConversation(request);
        return new ResponseEntity<>(ApiResponse.success("Conversation initialized successfully", conversation), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/messages")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Message>>> getMessages(@PathVariable Long id) {
        List<Message> messages = messagingService.getMessages(id);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/{id}/messages")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody MessageRequest request) {
        Message message = messagingService.sendMessage(id, request);
        return new ResponseEntity<>(ApiResponse.success("Message sent successfully", message), HttpStatus.CREATED);
    }
}
