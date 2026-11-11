package com.dnm.CineBookProject.service;

import com.dnm.CineBookProject.dto.CreateProfileRequest;
import com.dnm.CineBookProject.dto.ProfileResponse;
import com.dnm.CineBookProject.entity.Customer;
import com.dnm.CineBookProject.exception.ProfileConflictException;
import com.dnm.CineBookProject.exception.ResourceNotFoundException;
import com.dnm.CineBookProject.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class ProfileService {

     private final CustomerRepository customerRepository;

     public ProfileService(CustomerRepository customerRepository){
         this.customerRepository = customerRepository;
     }

     public ProfileResponse create(CreateProfileRequest request){
         String email = request.email().trim().toLowerCase(Locale.ROOT);
         String phone = normalize(request.phone());
         if(customerRepository.existsByEmail(email)){
             throw  new ProfileConflictException("An account already exists with this email");
         }
         if(customerRepository.existsByPhone(phone)){
             throw  new ProfileConflictException("An account already exists with the same phone number");
         }

         return ProfileResponse.from((customerRepository.save(new Customer(request.name().trim(),email,phone))));
     }

     public ProfileResponse login(String identifier){
         String value = identifier == null ? "" : identifier.trim();
         if (value.isEmpty()) {
             throw new IllegalArgumentException("Identifier is required");
         }

         String phone = value.replaceAll("\\D", "");
         Customer customer = value.contains("@")
                 ? customerRepository.findByEmail(value.toLowerCase(Locale.ROOT))
                     .orElseThrow(() -> new ResourceNotFoundException("Profile not found"))
                 : customerRepository.findByPhone(phone)
                     .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

         return ProfileResponse.from(customer);
     }

     public String normalize(String phone){
         String normalize = phone==null?"":phone.replaceAll("\\D","");
         if(normalize.length()<10 || normalize.length()>15){
             throw new IllegalArgumentException("Enter a valid phone number");
         }
         return normalize;
     }


}
