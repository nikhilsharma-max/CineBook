package com.dnm.CineBookProject.entity;

import com.dnm.CineBookProject.entity.Movie;
import com.dnm.CineBookProject.entity.Theatre;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="shows")
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY,optional = false ) //Multiple shows belong to one theatre
    private Theatre theatre;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    private LocalDateTime startsAt;

    private LocalDateTime endsAt;

    private BigDecimal ticketPrice;

    private int totalSeats;

    private int availableSeats;

    private boolean active;

    @Version //@Version annotation is used in JPA to implement optimistic locking
    private long version;
    public Show(){

    }

    public BigDecimal getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(BigDecimal ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    public Show(Movie movie, Theatre theatre, LocalDateTime startsAt, LocalDateTime endsAt, BigDecimal ticketPrice, int totalSeats) {
        this.movie = movie;
        this.theatre = theatre;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.totalSeats = totalSeats;
        this.ticketPrice = ticketPrice;
        this.availableSeats = totalSeats;
    }
    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Theatre getTheatre() {
        return theatre;
    }

    public void setTheatre(Theatre theatre) {
        this.theatre = theatre;
    }

    public LocalDateTime getStartAt() {
        return startsAt;
    }

    public void setStartAt(LocalDateTime startsAt) {
        this.startsAt = startsAt;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public void reserve(int seats){
        if(seats<=0 || seats>availableSeats){
            throw new IllegalArgumentException("Not enough seat available");
        }
        availableSeats-=seats;
    }

    public void release(int seats){
        availableSeats = Math.min(totalSeats,availableSeats+seats);

    }

//    public Object getO() {
//    }
}