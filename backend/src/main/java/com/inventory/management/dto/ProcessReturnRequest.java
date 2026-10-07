package com.inventory.management.dto;

import com.inventory.management.model.ReturnStatus;
import jakarta.validation.constraints.NotNull;

public class ProcessReturnRequest {

    @NotNull(message = "Return status is required")
    private ReturnStatus status;

    private String staffNotes;

    public ProcessReturnRequest() {
    }

    public ProcessReturnRequest(ReturnStatus status, String staffNotes) {
        this.status = status;
        this.staffNotes = staffNotes;
    }

    public ReturnStatus getStatus() {
        return status;
    }

    public void setStatus(ReturnStatus status) {
        this.status = status;
    }

    public String getStaffNotes() {
        return staffNotes;
    }

    public void setStaffNotes(String staffNotes) {
        this.staffNotes = staffNotes;
    }
}
