package com.dnm.CineBookProject.service;

import com.dnm.CineBookProject.dto.MovieResponse;
import com.dnm.CineBookProject.dto.ShowResponse;
import com.dnm.CineBookProject.dto.ShowSeatResponse;
import com.dnm.CineBookProject.dto.TheatreResponse;
import com.dnm.CineBookProject.repository.MovieRepository;
import com.dnm.CineBookProject.repository.ShowRepository;
import com.dnm.CineBookProject.repository.ShowSeatRepository;
import com.dnm.CineBookProject.repository.TheatreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CatalogService {

    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;

    public CatalogService(MovieRepository movieRepository, TheatreRepository theatreRepository, ShowRepository showRepository, ShowSeatRepository showSeatRepository) {
        this.movieRepository = movieRepository;
        this.theatreRepository = theatreRepository;
        this.showRepository = showRepository;
        this.showSeatRepository = showSeatRepository;
    }

    public List<MovieResponse> movies(){
        return movieRepository.findByActiveTrueOrderByTitle().stream()
                .map(MovieResponse::from).toList();
    }

    public List<TheatreResponse> theatres(String city){
        return theatreRepository.findByCityIgnoreCaseOrderByName(city)
                .stream().map(TheatreResponse::from).toList();
    }

    public List<ShowResponse> shows(String city, LocalDate date){

        LocalDateTime from = date.atStartOfDay();
        return showRepository.findActiveShows(city,from,from.plusDays(1)).stream()
                .map(show -> ShowResponse.from(show,showSeatRepository.findAvailableLabels(show.getId()))).toList();
    }

    public List<ShowSeatResponse> showSeats(Long showId) {
        return showSeatRepository.findByShowIdOrderById(showId).stream()
                .map(ShowSeatResponse::from)
                .toList();
    }


}
