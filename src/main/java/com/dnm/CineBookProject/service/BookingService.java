package com.dnm.CineBookProject.service;

import com.dnm.CineBookProject.dto.BookingResponse;
import com.dnm.CineBookProject.dto.CreateBookingRequest;
import com.dnm.CineBookProject.entity.Booking;
import com.dnm.CineBookProject.entity.BookingStatus;
import com.dnm.CineBookProject.entity.Show;
import com.dnm.CineBookProject.entity.ShowSeat;
import com.dnm.CineBookProject.exception.ResourceNotFoundException;
import com.dnm.CineBookProject.exception.SeatUnavailableException;
import com.dnm.CineBookProject.repository.BookingRepository;
import com.dnm.CineBookProject.repository.CustomerRepository;
import com.dnm.CineBookProject.repository.ShowRepository;
import com.dnm.CineBookProject.repository.ShowSeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class BookingService {
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;

    public BookingService(ShowRepository showRepository, ShowSeatRepository showSeatRepository,BookingRepository bookingRepository, CustomerRepository customerRepository) {
        this.showRepository = showRepository;
        this.showSeatRepository = showSeatRepository;
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public BookingResponse book(Long showId, CreateBookingRequest request){
        Show show = showRepository.findById(showId)
                .orElseThrow(()-> new ResourceNotFoundException("Show not found"));
        var customer = customerRepository.findById(request.profileId())
                .orElseThrow(()-> new ResourceNotFoundException("Customer not found"));
        List<String> labels = request.seatLabels().stream().map(label -> label.trim().toUpperCase(Locale.ROOT)).toList();
        if(labels.stream().distinct().count() != labels.size()){
            throw new SeatUnavailableException("Duplicate seat labels are not allowed");
        }
        List<ShowSeat> seats = showSeatRepository.findForUpdate(showId,labels);
        if((seats.size()!=labels.size()) || seats.stream().anyMatch(ShowSeat::isReserved)){
            throw  new SeatUnavailableException("One or more selected seats are unavailable");
        }
        seats.forEach(ShowSeat::reserve);
        show.reserve(labels.size());
        BigDecimal totalAmount = show.getTicketPrice().multiply(BigDecimal.valueOf(labels.size()));
        Booking booking = bookingRepository.save(new Booking(show, customer, totalAmount, labels));
        return BookingResponse.from(booking);//It takes the saved Booking
        // domain entity (save) and maps its internal fields
        // (such as ID, customer details, reserved seats, and
        // total amount) into a clean BookingResponse object.
    }

    @Transactional
    public BookingResponse find(Long bookingId){
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        return BookingResponse.from(booking);
    }

    @Transactional
    public List<BookingResponse> findByProfileId(Long profileId){
        if(!customerRepository.existsById(profileId)){
            throw  new ResourceNotFoundException("Profile not found");
        }
        List<BookingResponse> list = bookingRepository.findByCustomerIdOrderByBookedAtDesc(profileId).stream()
                .map(BookingResponse::from).toList();
        return list;
    }

    @Transactional
    public BookingResponse cancel(Long bookingId,Long profileId){
        Booking booking = bookingRepository.findByIdAndCustomerId(bookingId,profileId)
                .orElseThrow(()-> new ResourceNotFoundException("Booking not found"));
        if(booking.getStatus() == BookingStatus.CONFIRMED){
            List<ShowSeat> seats = showSeatRepository.findForUpdate(booking.getShow().getId(), booking.getSeatLabels());
            seats.forEach(ShowSeat::release);
            booking.getShow().release(booking.getSeatLabels().size());
            booking.cancel();
        }
        return BookingResponse.from(booking);
    }
}
