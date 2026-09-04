package com.wonderlife.api;

import com.wonderlife.service.PublicPriceLookupService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;

@RestController @RequestMapping("/api/public/price-lookup") public class PublicPriceLookupController{
 private final PublicPriceLookupService service;public PublicPriceLookupController(PublicPriceLookupService service){this.service=service;}
 @GetMapping("/period-retail") PublicPriceLookupService.Result period(@RequestParam LocalDate from,@RequestParam LocalDate to,@RequestParam(required=false)String itemCode){return call(()->service.period(from,to,itemCode));}
 @GetMapping("/regional") PublicPriceLookupService.Result regional(@RequestParam LocalDate from,@RequestParam LocalDate to,@RequestParam String regionCode,@RequestParam(required=false)String itemCode){return call(()->service.region(from,to,itemCode,regionCode));}
 private static <T>T call(java.util.function.Supplier<T> action){try{return action.get();}catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage(),e);}catch(IllegalStateException e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,e.getMessage(),e);}}
}
