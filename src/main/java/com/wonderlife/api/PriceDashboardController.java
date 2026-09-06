package com.wonderlife.api;

import com.wonderlife.domain.PriceDashboardItem;
import com.wonderlife.mapper.PriceMapper;
import com.wonderlife.mapper.PublicPriceStorageMapper;
import com.wonderlife.service.PublicPriceCollectionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController @RequestMapping("/api/public/prices") public class PriceDashboardController{
 private final PriceMapper mapper;private final PublicPriceStorageMapper publicMapper;
 public PriceDashboardController(PriceMapper mapper,PublicPriceStorageMapper publicMapper){this.mapper=mapper;this.publicMapper=publicMapper;}
 @GetMapping("/dashboard") Dashboard dashboard(){
  LocalDate date=mapper.latestDate();
  return new Dashboard(date==null?"":date.toString(),"한국농수산식품유통공사(aT)",false,date==null?List.of():mapper.latestItems());
 }
 public record Dashboard(String asOfDate,String source,boolean demo,List<PriceDashboardItem> items){}
 @GetMapping("/collection-status") CollectionStatus collectionStatus(){LocalDate today=LocalDate.now(ZoneId.of("Asia/Seoul"));Long recentRun=mapper.runId(today);return new CollectionStatus(today,new SourceStatus("RECENT",mapper.latestDate(),recentRun==null?"NOT_RUN":mapper.runStatus(recentRun),0),status(PublicPriceCollectionService.PERIOD,today),status(PublicPriceCollectionService.REGIONAL,today));}
 private SourceStatus status(String source,LocalDate today){String run=publicMapper.runStatus(source,today);return new SourceStatus(source,publicMapper.latestPriceDate(source),run==null?"NOT_RUN":run,publicMapper.collectedCount(source,today));}
 public record CollectionStatus(LocalDate businessDate,SourceStatus recent,SourceStatus periodRetail,SourceStatus regional){}public record SourceStatus(String source,LocalDate latestPriceDate,String status,int collectedRows){}
}
