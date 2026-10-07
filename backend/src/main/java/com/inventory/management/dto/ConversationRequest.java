package com.inventory.management.dto;

import com.inventory.management.model.ConversationType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ConversationRequest {

    @Size(max = 150)
    private String title;

    private ConversationType type = ConversationType.GENERAL;

    @NotNull(message = "Recipient/Participant ID is required")
    private Long participantTwoId;

    private Long relatedOrderId;

    private String initialMessage;

    public ConversationRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ConversationType getType() {
        return type;
    }

    public void setType(ConversationType type) {
        this.type = type;
    }

    public Long getParticipantTwoId() {
        return participantTwoId;
    }

    public void setParticipantTwoId(Long participantTwoId) {
        this.participantTwoId = participantTwoId;
    }

    public Long getRelatedOrderId() {
        return relatedOrderId;
    }

    public void setRelatedOrderId(Long relatedOrderId) {
        this.relatedOrderId = relatedOrderId;
    }

    public String getInitialMessage() {
        return initialMessage;
    }

    public void setInitialMessage(String initialMessage) {
        this.initialMessage = initialMessage;
    }
}
