package com.wonderlife.service;

import com.wonderlife.domain.PublicPriceRow;
import com.wonderlife.mapper.PublicPriceStorageMapper;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service public class PublicPriceLookupService{
 private final PublicPriceStorageMapper mapper;public PublicPriceLookupService(PublicPriceStorageMapper mapper){this.mapper=mapper;}
 public Result period(LocalDate from,LocalDate to,String itemCode){validateDates(from,to);return find(PublicPriceCollectionService.PERIOD,from,to,itemCode,null);}
 public Result region(LocalDate from,LocalDate to,String itemCode,String regionCode){validateDates(from,to);if(blank(regionCode))throw new IllegalArgumentException("지역을 선택해 주세요.");return find(PublicPriceCollectionService.REGIONAL,from,to,itemCode,regionCode);}
 public List<PublicPriceStorageMapper.ItemOption> periodItems(){return mapper.findItems(PublicPriceCollectionService.PERIOD);}
 public List<PublicPriceStorageMapper.ItemOption> regionalItems(){return mapper.findItems(PublicPriceCollectionService.REGIONAL);}
 public StatisticsResult periodStatistics(LocalDate from,LocalDate to,String itemCode){validateStatistics(from,to,itemCode);return statistics("period",from,to,itemCode,mapper.periodStatistics(PublicPriceCollectionService.PERIOD,from,to,itemCode));}
 public StatisticsResult regionalStatistics(LocalDate from,LocalDate to,String itemCode){validateStatistics(from,to,itemCode);return statistics("regional",from,to,itemCode,mapper.regionalStatistics(PublicPriceCollectionService.REGIONAL,from,to,itemCode));}
 private Result find(String source,LocalDate from,LocalDate to,String itemCode,String regionCode){List<PublicPriceRow> rows=mapper.find(source,from,to,itemCode,regionCode);return new Result(from,to,mapper.count(source,from,to,itemCode,regionCode),rows,"한국농수산식품유통공사(aT) · WonderLife 일일 저장 데이터");}
 private StatisticsResult statistics(String kind,LocalDate from,LocalDate to,String itemCode,List<PublicPriceStorageMapper.StatisticsPoint> points){String itemName=("period".equals(kind)?periodItems():regionalItems()).stream().filter(item->item.itemCode().equals(itemCode)).map(PublicPriceStorageMapper.ItemOption::itemName).findFirst().orElse(itemCode);int samples=points.stream().mapToInt(PublicPriceStorageMapper.StatisticsPoint::sampleCount).sum();return new StatisticsResult(kind,from,to,itemCode,itemName,samples,points);}
 private static void validateStatistics(LocalDate from,LocalDate to,String itemCode){validateDates(from,to);if(blank(itemCode))throw new IllegalArgumentException("통계를 볼 품목을 선택해 주세요.");}
 private static void validateDates(LocalDate from,LocalDate to){if(from==null||to==null||to.isBefore(from))throw new IllegalArgumentException("조회 기간을 확인해 주세요.");if(ChronoUnit.DAYS.between(from,to)>90)throw new IllegalArgumentException("조회 기간은 최대 90일입니다.");}
 private static boolean blank(String value){return value==null||value.isBlank();}
 public record Result(LocalDate from,LocalDate to,int totalCount,List<PublicPriceRow> items,String source){}
 public record StatisticsResult(String kind,LocalDate from,LocalDate to,String itemCode,String itemName,int totalSamples,List<PublicPriceStorageMapper.StatisticsPoint> points){}
}
