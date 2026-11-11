package com.dnm.CineBookProject.dto;

import com.dnm.CineBookProject.entity.Theatre;

public record TheatreResponse(
        Long id,
        String name,
        String city,
        String address
) {
    public static TheatreResponse from(Theatre theatre){
        return new TheatreResponse(theatre.getId(), theatre.getName(), theatre.getCity(), theatre.getAddress());
    }
}
