package com.wonderlife.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonderlife.domain.StoredPublicPriceRow;
import com.wonderlife.mapper.PublicPriceStorageMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service public class PublicPriceCollectionService{
 public static final String PERIOD="PERIOD_RETAIL",REGIONAL="REGIONAL";
 private static final ZoneId SEOUL=ZoneId.of("Asia/Seoul");private static final DateTimeFormatter SOURCE_DATE=DateTimeFormatter.BASIC_ISO_DATE;
 private static final List<String> REGIONS=List.of("1101","2300","3111","3138","3145","3112","3211","3214","2501","3411","2701","3311","2401","3613","3511","2200","3711","3714","3814","2100","2601","3911");
 private final PublicPriceStorageMapper mapper;private final ObjectMapper json;private final RestClient client;private final String key;private final String periodEndpoint;private final String regionEndpoint;
 public PublicPriceCollectionService(PublicPriceStorageMapper mapper,ObjectMapper json,RestClient.Builder builder,@Value("${app.price-collection.service-key:}")String key,@Value("${app.price-lookup.period-endpoint}")String periodEndpoint,@Value("${app.price-lookup.region-endpoint}")String regionEndpoint){this.mapper=mapper;this.json=json;var requestFactory=new JdkClientHttpRequestFactory();requestFactory.setReadTimeout(Duration.ofSeconds(20));this.client=builder.requestFactory(requestFactory).build();this.key=key;this.periodEndpoint=periodEndpoint;this.regionEndpoint=regionEndpoint;}
 public Results collect(boolean force){if(key.isBlank())return new Results(failed(PERIOD,"DATA_GO_KR_SERVICE_KEY is not configured"),failed(REGIONAL,"DATA_GO_KR_SERVICE_KEY is not configured"));LocalDate date=LocalDate.now(SEOUL),from=date.minusDays(7);return new Results(safely(()->collectSource(PERIOD,periodEndpoint,date,from,date,List.of(""),force),PERIOD,date),safely(()->collectSource(REGIONAL,regionEndpoint,date,from,date,REGIONS,force),REGIONAL,date));}
 private Result collectSource(String source,String endpoint,LocalDate businessDate,LocalDate from,LocalDate to,List<String> regions,boolean force){String status=mapper.runStatus(source,businessDate);if(!force&&("SUCCESS".equals(status)||mapper.runIsActive(source,businessDate)))return new Result(source,businessDate,0,true,status);mapper.startRun(source,businessDate);int saved=0;try{for(String region:regions)saved+=collectPages(source,endpoint,businessDate,from,to,region);mapper.finishRun(source,businessDate,saved);return new Result(source,businessDate,saved,false,"SUCCESS");}catch(Exception error){mapper.failRun(source,businessDate,truncate(error.getMessage()));throw new IllegalStateException(source+" price collection failed",error);}}
 private int collectPages(String source,String endpoint,LocalDate collectedDate,LocalDate from,LocalDate to,String region)throws Exception{int page=1,total=Integer.MAX_VALUE,saved=0;while((page-1)*1000<total){StringBuilder url=new StringBuilder(endpoint).append("?serviceKey=").append(key).append("&returnType=json&pageNo=").append(page).append("&numOfRows=1000");add(url,"cond[exmn_ymd::GTE]",from.format(SOURCE_DATE));add(url,"cond[exmn_ymd::LTE]",to.format(SOURCE_DATE));add(url,"cond[sgg_cd::EQ]",region);JsonNode root=json.readTree(requestWithRetry(URI.create(url.toString()))),response=root.path("response");if(response.isMissingNode())response=root;JsonNode header=response.path("header");String code=header.path("resultCode").asText("0");if(!"0".equals(code)&&!"00".equals(code))throw new IllegalStateException(header.path("resultMsg").asText("공공데이터 API 오류"));JsonNode body=response.path("body"),items=body.path("items").path("item");total=body.path("totalCount").asInt(0);List<StoredPublicPriceRow> batch=new ArrayList<>();if(items.isArray())for(JsonNode row:items)batch.add(map(source,collectedDate,row));for(int start=0;start<batch.size();start+=200){mapper.upsertBatch(batch.subList(start,Math.min(start+200,batch.size())));}saved+=batch.size();page++;}return saved;}
 private StoredPublicPriceRow map(String source,LocalDate collectedDate,JsonNode r){boolean period=PERIOD.equals(source);return new StoredPublicPriceRow(source,collectedDate,LocalDate.parse(text(r,"exmn_ymd"),SOURCE_DATE),text(r,"se_nm"),text(r,"ctgry_cd"),text(r,"ctgry_nm"),text(r,"item_cd"),text(r,"item_nm"),text(r,"vrty_cd"),text(r,"vrty_nm"),text(r,"grd_cd"),text(r,"grd_nm"),text(r,"sgg_cd"),text(r,"sgg_nm"),text(r,"mrkt_cd"),text(r,"mrkt_nm"),text(r,"unit"),text(r,"unit_sz"),period?decimal(r,"exmn_dd_prc"):decimal(r,"exmn_dd_avg_prc"),period?decimal(r,"exmn_dd_cnvs_prc"):decimal(r,"exmn_dd_cnvs_avg_prc"),decimal(r,"exmn_dd_min_prc"),decimal(r,"exmn_dd_avg_prc"),decimal(r,"exmn_dd_max_prc"));}
 private String requestWithRetry(URI uri){RestClientException last=null;for(int attempt=1;attempt<=3;attempt++)try{return client.get().uri(uri).retrieve().body(String.class);}catch(RestClientException error){last=error;if(attempt<3)try{Thread.sleep(300L*attempt);}catch(InterruptedException interrupted){Thread.currentThread().interrupt();throw new IllegalStateException("가격 수집이 중단되었습니다.",interrupted);}}throw last;}
 private static void add(StringBuilder url,String name,String value){if(value!=null&&!value.isBlank())url.append('&').append(URLEncoder.encode(name,StandardCharsets.UTF_8)).append('=').append(URLEncoder.encode(value,StandardCharsets.UTF_8));}
 private static String text(JsonNode r,String field){return r.path(field).asText("").trim();}private static BigDecimal decimal(JsonNode r,String field){String value=text(r,field).replace(",","");if(value.isBlank()||"-".equals(value))return null;try{return new BigDecimal(value);}catch(NumberFormatException ignored){return null;}}
 private static String truncate(String value){if(value==null)return "Unknown error";return value.length()>1000?value.substring(0,1000):value;}
 private Result safely(java.util.function.Supplier<Result> action,String source,LocalDate date){try{return action.get();}catch(Exception error){return new Result(source,date,0,false,"FAILED",truncate(error.getMessage()));}}private Result failed(String source,String message){return new Result(source,LocalDate.now(SEOUL),0,false,"FAILED",message);}
 public record Result(String source,LocalDate businessDate,int itemCount,boolean alreadyCollected,String status,String message){public Result(String source,LocalDate date,int count,boolean already,String status){this(source,date,count,already,status,"");}}public record Results(Result periodRetail,Result regional){}
}
