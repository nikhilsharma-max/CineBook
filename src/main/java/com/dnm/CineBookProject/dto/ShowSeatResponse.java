package com.dnm.CineBookProject.dto;

import com.dnm.CineBookProject.entity.ShowSeat;

public record ShowSeatResponse(Long showId, String seatLabel, boolean reserved) {
    public static ShowSeatResponse from(ShowSeat showSeat) {
        return new ShowSeatResponse(
                showSeat.getShow().getId(),
                showSeat.getSeatLabel(),
                showSeat.isReserved()
        );
    }
}
