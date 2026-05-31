package com.banking.controller;

import com.banking.dto.ApiResponse;
import com.banking.entity.User;
import com.banking.repository.UserRepository;
import com.banking.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserAccounts(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(new ApiResponse(true, "Accounts retrieved", accountService.getUserAccounts(userId)));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(new ApiResponse(true, "Account details", accountService.getAccountByNumber(accountNumber)));
    }

    @PostMapping
    public ResponseEntity<?> createAccount(Authentication authentication, @RequestBody Map<String, String> request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(new ApiResponse(true, "Account created", accountService.createAccount(userId, request.get("accountType"))));
    }

    private Long getUserId(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
