package com.wonderlife.api;

import com.wonderlife.service.PriceCollectionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController @RequestMapping("/api/internal/prices") public class PriceCollectionController{
 private final PriceCollectionService service;private final String token;
 public PriceCollectionController(PriceCollectionService service,@Value("${app.price-collection.job-token:}")String token){this.service=service;this.token=token;}
 @PostMapping("/collect") PriceCollectionService.Result collect(@RequestHeader(value="X-Price-Job-Token",required=false)String supplied){
  if(token.isBlank()||supplied==null||!MessageDigest.isEqual(token.getBytes(StandardCharsets.UTF_8),supplied.getBytes(StandardCharsets.UTF_8)))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
  return service.collect();
 }
}
