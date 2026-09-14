package com.wonderlife.api;

import com.wonderlife.service.NeisSchoolService;
import com.wonderlife.service.NeisDailyCollectionService;
import com.wonderlife.service.SchoolInfoCollectionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController @RequestMapping("/api/internal/education") public class EducationCollectionController{
 private final NeisSchoolService service;private final NeisDailyCollectionService daily;private final SchoolInfoCollectionService disclosures;private final String token;private final com.wonderlife.service.EducationBatchCoordinator coordinator;
 public EducationCollectionController(NeisSchoolService service,NeisDailyCollectionService daily,SchoolInfoCollectionService disclosures,com.wonderlife.service.EducationBatchCoordinator coordinator,@Value("${app.price-collection.job-token:}")String token){this.coordinator=coordinator;this.service=service;this.daily=daily;this.disclosures=disclosures;this.token=token;}
 @PostMapping("/collect") Result collect(@RequestHeader(value="X-Price-Job-Token",required=false)String supplied,@RequestParam(defaultValue="false")boolean force,@RequestParam(defaultValue="30")int disclosureLimit,@RequestParam(defaultValue="50")int dailySchoolLimit){if(token.isBlank()||supplied==null||!MessageDigest.isEqual(token.getBytes(StandardCharsets.UTF_8),supplied.getBytes(StandardCharsets.UTF_8)))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);return new Result(service.collect(force),coordinator.collectDaily(dailySchoolLimit,force),coordinator.collectDisclosures(disclosureLimit,force));}
 public record Result(NeisSchoolService.Result schools,NeisDailyCollectionService.Result daily,SchoolInfoCollectionService.Result disclosures){}
}
