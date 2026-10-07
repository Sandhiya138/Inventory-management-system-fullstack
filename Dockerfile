# ==============================================================================
# VelvetStock Backend - Root Dockerfile (Spring Boot 3 + Java 17)
# ==============================================================================

# Stage 1: Build the backend from repository root
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy backend pom.xml and source files
COPY backend/pom.xml ./
COPY backend/src ./src

# Build production JAR
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE 17 runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/inventory-management-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
