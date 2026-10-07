# ==============================================================================
# VelvetStock Backend - Multi-Stage Docker Build (Spring Boot 3 + Java 17)
# ==============================================================================

# Stage 1: Build the application using Maven and Eclipse Temurin JDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application as an executable JAR without running tests during build
RUN mvn clean package -DskipTests

# Stage 2: Create a minimal, lightweight runtime image with JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR artifact from the build stage
COPY --from=build /app/target/inventory-management-backend-1.0.0.jar app.jar

# Dynamic PORT provided by cloud environments (Render defaults to 10000 or 8080)
ENV PORT=8080
EXPOSE 8080

# Start Spring Boot
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
