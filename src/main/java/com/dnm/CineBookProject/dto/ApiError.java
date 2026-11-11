package com.dnm.CineBookProject.dto;

import java.time.Instant;

public record ApiError(Instant timeStamp,int status,String error,String message, String path){

}
