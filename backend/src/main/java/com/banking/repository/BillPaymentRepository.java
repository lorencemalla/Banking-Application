package com.banking.repository;

import com.banking.entity.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
    List<BillPayment> findByUserId(Long userId);
    List<BillPayment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
