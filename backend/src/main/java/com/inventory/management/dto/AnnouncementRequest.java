package com.inventory.management.dto;

import com.inventory.management.model.AnnouncementPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150)
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private AnnouncementPriority priority = AnnouncementPriority.NORMAL;

    private String targetAudience = "ALL";

    public AnnouncementRequest() {
    }

    public AnnouncementRequest(String title, String message, AnnouncementPriority priority) {
        this.title = title;
        this.message = message;
        this.priority = priority;
        this.targetAudience = "ALL";
    }

    public AnnouncementRequest(String title, String message, AnnouncementPriority priority, String targetAudience) {
        this.title = title;
        this.message = message;
        this.priority = priority;
        this.targetAudience = targetAudience != null ? targetAudience : "ALL";
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public AnnouncementPriority getPriority() {
        return priority;
    }

    public void setPriority(AnnouncementPriority priority) {
        this.priority = priority;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }
}
