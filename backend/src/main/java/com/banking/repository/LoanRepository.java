package com.banking.repository;

import com.banking.entity.Loan;
import com.banking.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);
    Optional<Loan> findByLoanId(String loanId);
    List<Loan> findByStatus(LoanStatus status);
    long countByStatus(LoanStatus status);
}
