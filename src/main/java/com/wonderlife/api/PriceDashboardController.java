package com.wonderlife.api;

import com.wonderlife.domain.PriceDashboardItem;
import com.wonderlife.mapper.PriceMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/api/public/prices") public class PriceDashboardController{
 private final PriceMapper mapper;
 public PriceDashboardController(PriceMapper mapper){this.mapper=mapper;}
 @GetMapping("/dashboard") Dashboard dashboard(){
  LocalDate date=mapper.latestDate();
  return new Dashboard(date==null?"":date.toString(),"한국농수산식품유통공사(aT)",false,date==null?List.of():mapper.latestItems());
 }
 public record Dashboard(String asOfDate,String source,boolean demo,List<PriceDashboardItem> items){}
}
