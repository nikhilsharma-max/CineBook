
package com.dnm.CineBookProject.repository;

import com.dnm.CineBookProject.entity.Booking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = "seatLabels")
    List<Booking> findByCustomerPhoneOrderByBookedAtDesc(String customerPhone);

    @EntityGraph(attributePaths = "seatLabels")
    Optional<Booking> findById(Long id);

    @EntityGraph(attributePaths = "seatLabels")
    List<Booking> findByCustomerIdOrderByBookedAtDesc(Long customerId);

    @EntityGraph(attributePaths = "seatLabels")
    Optional<Booking> findByIdAndCustomerId(Long id, Long customerId);

    @EntityGraph(attributePaths = {
            "seatLabels",
            "show",
            "show.movie",
            "show.theatre"
    })
    Optional<Booking> findWithDetailsById(Long id);
}
