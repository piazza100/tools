package com.wonderlife.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonderlife.mapper.PriceMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service public class PriceCollectionService{
 private static final ZoneId SEOUL=ZoneId.of("Asia/Seoul");
 private static final DateTimeFormatter SOURCE_DATE=DateTimeFormatter.BASIC_ISO_DATE;
 private final PriceMapper mapper;private final ObjectMapper json;private final RestClient client;private final String key;private final String endpoint;private final int pageSize;
 public PriceCollectionService(PriceMapper mapper,ObjectMapper json,RestClient.Builder builder,
  @Value("${app.price-collection.service-key:}")String key,@Value("${app.price-collection.endpoint}")String endpoint,
  @Value("${app.price-collection.page-size:500}")int pageSize){this.mapper=mapper;this.json=json;this.client=builder.build();this.key=key;this.endpoint=endpoint;this.pageSize=pageSize;}

 public Result collect(){
  if(key.isBlank())throw new IllegalStateException("DATA_GO_KR_SERVICE_KEY is not configured");
  LocalDate businessDate=LocalDate.now(SEOUL);Long existing=mapper.runId(businessDate);if(existing!=null)return new Result(existing,0,true);
  var run=new PriceMapper.MutableId();
  try{mapper.startRun(businessDate,run);}catch(DuplicateKeyException duplicate){return new Result(mapper.runId(businessDate),0,true);}
  int saved=0;
  try{
   int page=1,total=Integer.MAX_VALUE;
   while((page-1)*pageSize<total){
    String body=client.get().uri(URI.create(endpoint+"?serviceKey="+key+"&returnType=json&pageNo="+page+"&numOfRows="+pageSize)).retrieve().body(String.class);
    if(body==null||body.isBlank())throw new IllegalStateException("Empty response from price API");
    JsonNode root=json.readTree(body),header=root.path("response").path("header");
    if(!"0".equals(header.path("resultCode").asText()))throw new IllegalStateException("Price API: "+header.path("resultMsg").asText("unknown error"));
    JsonNode responseBody=root.path("response").path("body");total=responseBody.path("totalCount").asInt(0);mapper.insertRaw(run.id,page,body);
    JsonNode rows=responseBody.path("items").path("item");
    if(rows.isArray())for(JsonNode row:rows)if(save(row))saved++;
    page++;
   }
   mapper.finishRun(run.id,saved);return new Result(run.id,saved,false);
  }catch(Exception error){mapper.failRun(run.id,truncate(error.getMessage()));throw new IllegalStateException("Daily price collection failed",error);}
 }
 private boolean save(JsonNode row){
  BigDecimal current=decimal(row,"exmn_dd_prc");if(current==null)return false;
  var item=new PriceMapper.MutableId();String se=text(row,"se_cd");
  mapper.upsertItem(text(row,"item_cd"),text(row,"vrty_cd"),text(row,"grd_cd"),text(row,"item_nm"),text(row,"vrty_nm"),text(row,"grd_nm"),unit(row),"01".equals(se)?"RETAIL":"WHOLESALE",item);
  mapper.upsertSnapshot(item.id,LocalDate.parse(text(row,"exmn_ymd"),SOURCE_DATE),current,decimal(row,"exmn_dd_cnvs_prc"),decimal(row,"dd1_bfr_prc"),decimal(row,"ww1_bfr_prc"),decimal(row,"mm1_bfr_prc"),decimal(row,"yy1_bfr_prc"));return true;
 }
 private static String unit(JsonNode row){String size=text(row,"unit_sz"),unit=text(row,"unit");return size.isBlank()?unit:size+unit;}
 private static String text(JsonNode row,String field){return row.path(field).asText("").trim();}
 private static BigDecimal decimal(JsonNode row,String field){String value=text(row,field).replace(",","");if(value.isBlank()||"-".equals(value))return null;try{return new BigDecimal(value);}catch(NumberFormatException ignored){return null;}}
 private static String truncate(String value){if(value==null)return "Unknown error";return value.length()>1000?value.substring(0,1000):value;}
 public record Result(long runId,int itemCount,boolean alreadyCollected){}
}
