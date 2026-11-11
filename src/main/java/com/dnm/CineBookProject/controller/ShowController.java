package com.dnm.CineBookProject.controller;

import com.dnm.CineBookProject.dto.ShowResponse;
import com.dnm.CineBookProject.dto.ShowSeatResponse;
import com.dnm.CineBookProject.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shows")
public class ShowController {
    private final CatalogService catalogService;

    public ShowController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<ShowResponse> shows(@RequestParam String city, @RequestParam LocalDate date){
        return catalogService.shows(city,date);
    }

    @GetMapping("/{showId}/seats")
    public List<ShowSeatResponse> showSeats(@PathVariable Long showId) {
        System.out.println("Request received on show seat controller");
        System.out.println(showId);
        return catalogService.showSeats(showId);
    }
}
