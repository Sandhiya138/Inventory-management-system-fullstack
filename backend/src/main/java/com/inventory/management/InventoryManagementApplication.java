package com.inventory.management;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class InventoryManagementApplication {

    @PostConstruct
    public void init() {
        // Enforce Indian Standard Timezone (Asia/Kolkata) across JVM for consistent timestamps
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        SpringApplication.run(InventoryManagementApplication.class, args);
    }
}
