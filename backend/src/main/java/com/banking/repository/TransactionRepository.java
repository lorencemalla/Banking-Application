package com.banking.repository;

import com.banking.entity.Account;
import com.banking.entity.Transaction;
import com.banking.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT t FROM Transaction t WHERE t.fromAccount = :account OR t.toAccount = :account ORDER BY t.createdAt DESC")
    Page<Transaction> findByAccount(@Param("account") Account account, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount = :account OR t.toAccount = :account) ORDER BY t.createdAt DESC")
    List<Transaction> findRecentByAccount(@Param("account") Account account, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId) ORDER BY t.createdAt DESC")
    List<Transaction> findByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId) AND t.createdAt BETWEEN :start AND :end ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<Transaction> findByStatus(TransactionStatus status);

    long countByStatus(TransactionStatus status);
}
