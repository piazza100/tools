package com.wonderlife.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonderlife.domain.PublicPriceRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service public class PublicPriceLookupService{
 private static final DateTimeFormatter SOURCE_DATE=DateTimeFormatter.BASIC_ISO_DATE;
 private final ObjectMapper json;private final RestClient client;private final String key;private final String periodEndpoint;private final String regionEndpoint;
 public PublicPriceLookupService(ObjectMapper json,RestClient.Builder builder,@Value("${app.price-collection.service-key:}")String key,
  @Value("${app.price-lookup.period-endpoint}")String periodEndpoint,@Value("${app.price-lookup.region-endpoint}")String regionEndpoint){this.json=json;this.client=builder.build();this.key=key;this.periodEndpoint=periodEndpoint;this.regionEndpoint=regionEndpoint;}

 public Result period(LocalDate from,LocalDate to,String itemCode){validateDates(from,to);return fetch(periodEndpoint,from,to,itemCode,null,true);}
 public Result region(LocalDate from,LocalDate to,String itemCode,String regionCode){validateDates(from,to);if(blank(regionCode))throw new IllegalArgumentException("지역 코드를 입력해 주세요.");return fetch(regionEndpoint,from,to,itemCode,regionCode,false);}
 private Result fetch(String endpoint,LocalDate from,LocalDate to,String itemCode,String regionCode,boolean period){
  if(key.isBlank())throw new IllegalStateException("DATA_GO_KR_SERVICE_KEY is not configured");
  StringBuilder url=new StringBuilder(endpoint).append("?serviceKey=").append(key).append("&returnType=json&pageNo=1&numOfRows=500")
   .append("&cond%5Bexmn_ymd%3A%3AGTE%5D=").append(from.format(SOURCE_DATE)).append("&cond%5Bexmn_ymd%3A%3ALTE%5D=").append(to.format(SOURCE_DATE));
  add(url,"cond[item_cd::EQ]",itemCode);add(url,"cond[sgg_cd::EQ]",regionCode);
  try{
   String raw=client.get().uri(URI.create(url.toString())).retrieve().body(String.class);JsonNode root=json.readTree(raw);
   JsonNode response=root.path("response");if(response.isMissingNode())response=root;
   JsonNode header=response.path("header");String code=header.path("resultCode").asText("0");if(!"0".equals(code)&&!"00".equals(code))throw new IllegalStateException(header.path("resultMsg").asText("공공데이터 API 오류"));
   JsonNode body=response.path("body"),items=body.path("items").path("item");List<PublicPriceRow> rows=new ArrayList<>();
   if(items.isArray())for(JsonNode row:items)rows.add(map(row,period));
   return new Result(from,to,body.path("totalCount").asInt(rows.size()),rows,"한국농수산식품유통공사(aT)");
  }catch(IllegalStateException e){throw e;}catch(Exception e){throw new IllegalStateException("가격 정보를 불러오지 못했습니다.",e);}
 }
 private static PublicPriceRow map(JsonNode r,boolean period){return new PublicPriceRow(text(r,"exmn_ymd"),text(r,"se_nm"),text(r,"ctgry_cd"),text(r,"ctgry_nm"),text(r,"item_cd"),text(r,"item_nm"),text(r,"vrty_cd"),text(r,"vrty_nm"),text(r,"grd_cd"),text(r,"grd_nm"),text(r,"sgg_cd"),text(r,"sgg_nm"),text(r,"mrkt_cd"),text(r,"mrkt_nm"),unit(r),period?decimal(r,"exmn_dd_prc"):decimal(r,"exmn_dd_avg_prc"),period?decimal(r,"exmn_dd_cnvs_prc"):decimal(r,"exmn_dd_cnvs_avg_prc"),decimal(r,"exmn_dd_min_prc"),decimal(r,"exmn_dd_avg_prc"),decimal(r,"exmn_dd_max_prc"));}
 private static void validateDates(LocalDate from,LocalDate to){if(from==null||to==null||to.isBefore(from))throw new IllegalArgumentException("조회 기간을 확인해 주세요.");if(ChronoUnit.DAYS.between(from,to)>90)throw new IllegalArgumentException("조회 기간은 최대 90일입니다.");}
 private static void add(StringBuilder url,String name,String value){if(!blank(value))url.append('&').append(URLEncoder.encode(name,StandardCharsets.UTF_8)).append('=').append(URLEncoder.encode(value.trim(),StandardCharsets.UTF_8));}
 private static boolean blank(String value){return value==null||value.isBlank();}private static String text(JsonNode r,String f){return r.path(f).asText("").trim();}
 private static String unit(JsonNode r){String size=text(r,"unit_sz"),unit=text(r,"unit");return size.isBlank()?unit:size+unit;}
 private static BigDecimal decimal(JsonNode r,String f){String v=text(r,f).replace(",","");if(v.isBlank()||"-".equals(v))return null;try{return new BigDecimal(v);}catch(NumberFormatException e){return null;}}
 public record Result(LocalDate from,LocalDate to,int totalCount,List<PublicPriceRow> items,String source){}
}
