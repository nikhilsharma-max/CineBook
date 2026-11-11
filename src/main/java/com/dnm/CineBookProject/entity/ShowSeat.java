package com.dnm.CineBookProject.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "show_seats", uniqueConstraints = @UniqueConstraint(name = "uk_show_seats",columnNames = {"show_id","seatLabel"}))
public class ShowSeat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    private Show show;

    private String seatLabel;

    private boolean reserved;//initially false

    public ShowSeat(){

    }

    public ShowSeat(Show show, String seatLabel) {
        this.show = show;
        this.seatLabel = seatLabel;
    }

    public Show getShow() {
        return show;
    }

    public void setShow(Show show) {
        this.show = show;
    }

    public boolean isReserved(){
        return reserved;
    }

    public String getSeatLabel(){
        return seatLabel;
    }

    public String getLabel(){
        return seatLabel;
    }

    public void setReserved(boolean reserved) {
        this.reserved = reserved;
    }

    public void reserve(){
        reserved = true;
    }
    public void release(){
        reserved = false;
    }

}
