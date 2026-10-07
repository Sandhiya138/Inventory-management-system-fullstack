package com.inventory.management.service;

import com.inventory.management.security.JwtTokenProvider;
import com.inventory.management.security.UserDetailsImpl;
import com.inventory.management.dto.AuthRequest;
import com.inventory.management.dto.AuthResponse;
import com.inventory.management.dto.SignupRequest;
import com.inventory.management.dto.UserDto;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.Role;
import com.inventory.management.model.User;
import com.inventory.management.model.UserStatus;
import com.inventory.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse authenticateUser(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        if (userDetails.getStatus() == UserStatus.INACTIVE) {
            throw new BadRequestException("User account is inactive. Please contact system administrator.");
        }

        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                userDetails.getRole()
        );
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));
    }

    public UserDto getCurrentUserDto() {
        return new UserDto(getCurrentUser());
    }

    @Transactional
    public AuthResponse registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with this email already exists. Please log in.");
        }

        Role role = signupRequest.getRole() != null ? signupRequest.getRole() : Role.VIEWER;
        // Restrict public registration: allow VIEWER or STAFF (default to VIEWER, disallow self-appointing ADMIN)
        if (role == Role.ADMIN) {
            role = Role.VIEWER;
        }

        User user = new User(
                signupRequest.getFullName().trim(),
                signupRequest.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(signupRequest.getPassword()),
                signupRequest.getPhone() != null ? signupRequest.getPhone().trim() : null,
                role,
                UserStatus.ACTIVE
        );

        User savedUser = userRepository.save(user);

        // Authenticate the newly registered user and issue JWT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signupRequest.getEmail().trim().toLowerCase(), signupRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }
}
