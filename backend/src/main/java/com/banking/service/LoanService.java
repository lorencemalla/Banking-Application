package com.banking.service;

import com.banking.entity.Loan;
import com.banking.entity.User;
import com.banking.enums.LoanStatus;
import com.banking.repository.LoanRepository;
import com.banking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Map<String, Object>> getUserLoans(Long userId) {
        List<Loan> loans = loanRepository.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Loan l : loans) {
            result.add(mapLoan(l));
        }
        return result;
    }

    public Loan applyLoan(Long userId, Map<String, String> request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal amount = new BigDecimal(request.get("amount"));
        BigDecimal interestRate = new BigDecimal(request.get("interestRate"));
        int termMonths = Integer.parseInt(request.get("termMonths"));

        BigDecimal emi = calculateEMI(amount, interestRate, termMonths);

        Loan loan = new Loan();
        loan.setLoanId("LN" + System.currentTimeMillis());
        loan.setUser(user);
        loan.setLoanType(request.get("loanType"));
        loan.setAmount(amount);
        loan.setInterestRate(interestRate);
        loan.setTermMonths(termMonths);
        loan.setEmi(emi);
        loan.setRemainingAmount(amount.add(amount.multiply(interestRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)));
        loan.setStatus(LoanStatus.PENDING);
        return loanRepository.save(loan);
    }

    public Map<String, Object> calculateEMIDetails(BigDecimal amount, BigDecimal annualRate, int termMonths) {
        BigDecimal emi = calculateEMI(amount, annualRate, termMonths);
        BigDecimal totalPayment = emi.multiply(new BigDecimal(termMonths));
        BigDecimal totalInterest = totalPayment.subtract(amount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("emi", emi);
        result.put("totalPayment", totalPayment);
        result.put("totalInterest", totalInterest);
        result.put("principal", amount);
        result.put("termMonths", termMonths);
        result.put("annualRate", annualRate);
        return result;
    }

    private BigDecimal calculateEMI(BigDecimal principal, BigDecimal annualRate, int termMonths) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(new BigDecimal(termMonths), 2, RoundingMode.HALF_UP);
        }
        BigDecimal monthlyRate = annualRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        double power = Math.pow(onePlusR.doubleValue(), termMonths);
        BigDecimal powerBD = new BigDecimal(power, new MathContext(10));
        BigDecimal numerator = principal.multiply(monthlyRate).multiply(powerBD);
        BigDecimal denominator = powerBD.subtract(BigDecimal.ONE);
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private Map<String, Object> mapLoan(Loan l) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", l.getId());
        map.put("loanId", l.getLoanId());
        map.put("loanType", l.getLoanType());
        map.put("amount", l.getAmount());
        map.put("interestRate", l.getInterestRate());
        map.put("termMonths", l.getTermMonths());
        map.put("emi", l.getEmi());
        map.put("totalPaid", l.getTotalPaid());
        map.put("remainingAmount", l.getRemainingAmount());
        map.put("status", l.getStatus().name());
        map.put("createdAt", l.getCreatedAt());
        map.put("approvedAt", l.getApprovedAt());
        return map;
    }
}
