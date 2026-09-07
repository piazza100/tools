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
 private Result find(String source,LocalDate from,LocalDate to,String itemCode,String regionCode){List<PublicPriceRow> rows=mapper.find(source,from,to,itemCode,regionCode);return new Result(from,to,mapper.count(source,from,to,itemCode,regionCode),rows,"한국농수산식품유통공사(aT) · WonderLife 일일 저장 데이터");}
 private static void validateDates(LocalDate from,LocalDate to){if(from==null||to==null||to.isBefore(from))throw new IllegalArgumentException("조회 기간을 확인해 주세요.");if(ChronoUnit.DAYS.between(from,to)>90)throw new IllegalArgumentException("조회 기간은 최대 90일입니다.");}
 private static boolean blank(String value){return value==null||value.isBlank();}
 public record Result(LocalDate from,LocalDate to,int totalCount,List<PublicPriceRow> items,String source){}
}
