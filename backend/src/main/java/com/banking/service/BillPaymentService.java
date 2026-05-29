package com.banking.service;

import com.banking.entity.Account;
import com.banking.entity.BillPayment;
import com.banking.entity.Notification;
import com.banking.entity.User;
import com.banking.enums.BillCategory;
import com.banking.repository.AccountRepository;
import com.banking.repository.BillPaymentRepository;
import com.banking.repository.NotificationRepository;
import com.banking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BillPaymentService {

    @Autowired
    private BillPaymentRepository billPaymentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Map<String, Object> payBill(Long userId, Map<String, String> request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = accountRepository.findByAccountNumber(request.get("accountNumber"))
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        BigDecimal amount = new BigDecimal(request.get("amount"));
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        BillPayment bill = new BillPayment();
        bill.setUser(user);
        bill.setAccount(account);
        bill.setCategory(BillCategory.valueOf(request.get("category").toUpperCase()));
        bill.setBillerName(request.get("billerName"));
        bill.setConsumerNumber(request.get("consumerNumber"));
        bill.setAmount(amount);
        bill.setPaid(true);
        bill.setPaidAt(LocalDateTime.now());
        bill.setReferenceNumber("BILL" + System.currentTimeMillis());
        billPaymentRepository.save(bill);

        // Create notification
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Bill Payment Successful");
        notification.setMessage("₹" + amount + " paid for " + request.get("billerName"));
        notification.setType("TRANSACTION");
        notificationRepository.save(notification);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", bill.getId());
        result.put("referenceNumber", bill.getReferenceNumber());
        result.put("amount", bill.getAmount());
        result.put("billerName", bill.getBillerName());
        result.put("status", "PAID");
        return result;
    }

    public List<Map<String, Object>> getBillHistory(Long userId) {
        List<BillPayment> bills = billPaymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (BillPayment b : bills) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", b.getId());
            map.put("category", b.getCategory().name());
            map.put("billerName", b.getBillerName());
            map.put("consumerNumber", b.getConsumerNumber());
            map.put("amount", b.getAmount());
            map.put("paid", b.isPaid());
            map.put("referenceNumber", b.getReferenceNumber());
            map.put("paidAt", b.getPaidAt());
            map.put("createdAt", b.getCreatedAt());
            result.add(map);
        }
        return result;
    }
}
