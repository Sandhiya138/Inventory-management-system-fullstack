package com.inventory.management.service;

import com.inventory.management.dto.CreateUserRequest;
import com.inventory.management.dto.UpdateUserRequest;
import com.inventory.management.dto.UserDto;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.model.Role;
import com.inventory.management.model.User;
import com.inventory.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Autowired
    private com.inventory.management.repository.StockMovementRepository stockMovementRepository;

    @Autowired
    private com.inventory.management.repository.OrderRepository orderRepository;

    @Autowired
    private com.inventory.management.repository.ReturnRepository returnRepository;

    @Autowired
    private com.inventory.management.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.inventory.management.repository.MessageRepository messageRepository;

    @Autowired
    private com.inventory.management.repository.ConversationRepository conversationRepository;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return new UserDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                request.getRole(),
                request.getStatus()
        );

        User savedUser = userRepository.save(user);
        return new UserDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already taken: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        User updatedUser = userRepository.save(user);
        return new UserDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new BadRequestException("You cannot delete your own account");
        }

        if (user.getRole() == Role.ADMIN) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            if (admins.size() <= 1) {
                throw new BadRequestException("Cannot delete the only remaining administrator");
            }
        }

        stockMovementRepository.clearUserReferences(id);
        orderRepository.clearAssignedStaffReferences(id);
        orderRepository.clearViewerReferences(id);
        returnRepository.clearProcessedByReferences(id);
        returnRepository.deleteByRequestedById(id);
        notificationRepository.deleteByRecipientId(id);
        messageRepository.deleteByParticipantUserId(id);
        messageRepository.deleteBySenderId(id);
        conversationRepository.deleteByUserId(id);

        userRepository.delete(user);
    }
}
