package com.dnm.CineBookProject.controller;


import com.dnm.CineBookProject.dto.ApiError;
import com.dnm.CineBookProject.exception.ProfileConflictException;
import com.dnm.CineBookProject.exception.ResourceNotFoundException;
import com.dnm.CineBookProject.exception.SeatUnavailableException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class ApiExceptionhandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiError> notFound(ResourceNotFoundException exception, HttpServletRequest request){
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(SeatUnavailableException.class)
    ResponseEntity<ApiError> seatConflict(RuntimeException exception, HttpServletRequest request){
        return error(HttpStatus.CONFLICT, exception.getMessage(), request);
    }

    @ExceptionHandler(ProfileConflictException.class)
    ResponseEntity<ApiError> profileConflict(RuntimeException exception, HttpServletRequest request){
        return error(HttpStatus.CONFLICT, exception.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> validationError(RuntimeException exception, HttpServletRequest request){
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    ResponseEntity<ApiError> validation(RuntimeException exception, HttpServletRequest request){
        return error(HttpStatus.BAD_REQUEST, "Request Validation failed", request);
    }
    private ResponseEntity<ApiError> error(HttpStatus status,String msg, HttpServletRequest request){
        return ResponseEntity.status(status).body(new ApiError(Instant.now(),status.value(),status.getReasonPhrase(),msg,request.getRequestURI()));
    }
}
