package com.wonderlife.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonderlife.mapper.NeisDailyMapper;
import com.wonderlife.mapper.EducationBatchMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service public class NeisDailyCollectionService{
 private static final DateTimeFormatter BASIC=DateTimeFormatter.BASIC_ISO_DATE;private static final ZoneId SEOUL=ZoneId.of("Asia/Seoul");
 private final String key;private final String endpoint;private final ObjectMapper json;private final NeisDailyMapper mapper;private final RestClient client;private final EducationBatchMapper freshness;
 public NeisDailyCollectionService(@Value("${app.neis.api-key:}")String key,@Value("${app.neis.endpoint}")String endpoint,ObjectMapper json,NeisDailyMapper mapper,EducationBatchMapper freshness,RestClient.Builder builder){this.freshness=freshness;this.key=key;this.endpoint=endpoint;this.json=json;this.mapper=mapper;var factory=new JdkClientHttpRequestFactory();factory.setReadTimeout(Duration.ofSeconds(40));this.client=builder.requestFactory(factory).build();}
 public Result collect(int requestedLimit){return collect(requestedLimit,()->{});}
 public Result collect(int requestedLimit,Runnable heartbeat){
  if(key.isBlank())throw new IllegalStateException("NEIS_API_KEY is not configured");
  LocalDate today=LocalDate.now(SEOUL);int total=mapper.schoolTotal(),offset=mapper.nextOffset(),limit=Math.max(1,Math.min(requestedLimit,50)),meals=0,schedules=0,failed=0,processed=0;
  if(total==0)throw new IllegalStateException("School master data must be collected first");
  mapper.startBatch();
  try{
   var schools=mapper.schools(offset,limit);
   for(var school:schools){
    heartbeat.run();
    var last=freshness.lastSuccess(school.office(),school.school());
    if(!today.equals(last)){
     try{
      LocalDate from=EducationCollectionWindow.from(today,last);
      meals+=collectMeals(school,from,today.plusDays(30));
      schedules+=collectSchedules(school,from,today.plusDays(90));
      freshness.success(school.office(),school.school(),today);
     }catch(Exception error){freshness.failure(school.office(),school.school());failed++;}
    }
    processed++;freshness.checkpoint(offset+processed);
   }
   int next=offset+processed,cycle=0;if(next>=total){next=0;cycle=1;freshness.completeDaily(today);}
   mapper.finishBatch(next,cycle);if(failed>0)freshness.partialDaily();
   return new Result(meals,schedules,today,processed,next,total,failed,failed>0?"PARTIAL":"SUCCESS");
  }catch(Exception error){mapper.failBatch(offset+processed,"Batch infrastructure failure");throw new IllegalStateException("NEIS batch infrastructure failed",error);}
 }
 private int collectMeals(NeisDailyMapper.SchoolKey school,LocalDate from,LocalDate to){return collect("mealServiceDietInfo",new String[][]{{"ATPT_OFCDC_SC_CODE",school.office()},{"SD_SCHUL_CODE",school.school()},{"MLSV_FROM_YMD",BASIC.format(from)},{"MLSV_TO_YMD",BASIC.format(to)}},rows->{List<NeisDailyMapper.MealRow> batch=new ArrayList<>();rows.forEach(row->batch.add(new NeisDailyMapper.MealRow(text(row,"ATPT_OFCDC_SC_CODE"),text(row,"SD_SCHUL_CODE"),date(row,"MLSV_YMD"),text(row,"MMEAL_SC_CODE"),text(row,"MMEAL_SC_NM"),clean(text(row,"DDISH_NM")),clean(text(row,"ORPLC_INFO")),text(row,"CAL_INFO"),clean(text(row,"NTR_INFO")))));if(!batch.isEmpty())mapper.upsertMeals(batch);});}
 private int collectSchedules(NeisDailyMapper.SchoolKey school,LocalDate from,LocalDate to){return collect("SchoolSchedule",new String[][]{{"ATPT_OFCDC_SC_CODE",school.office()},{"SD_SCHUL_CODE",school.school()},{"AA_FROM_YMD",BASIC.format(from)},{"AA_TO_YMD",BASIC.format(to)}},rows->{List<NeisDailyMapper.ScheduleRow> batch=new ArrayList<>();rows.forEach(row->{String scope=String.join(",",text(row,"ONE_GRADE_EVENT_YN"),text(row,"TW_GRADE_EVENT_YN"),text(row,"THREE_GRADE_EVENT_YN"),text(row,"FR_GRADE_EVENT_YN"),text(row,"FIV_GRADE_EVENT_YN"),text(row,"SIX_GRADE_EVENT_YN"));batch.add(new NeisDailyMapper.ScheduleRow(text(row,"ATPT_OFCDC_SC_CODE"),text(row,"SD_SCHUL_CODE"),row.path("AY").asInt(),date(row,"AA_YMD"),text(row,"EVENT_NM"),text(row,"EVENT_CNTNT"),scope));});if(!batch.isEmpty())mapper.upsertSchedules(batch);});}
 private int collect(String dataset,String[][] filters,PageConsumer consumer){int page=1,total=Integer.MAX_VALUE,saved=0,size=500;while((page-1)*size<total){try{var builder=UriComponentsBuilder.fromUriString(endpoint+"/"+dataset).queryParam("KEY",key).queryParam("Type","json").queryParam("pIndex",page).queryParam("pSize",size);for(String[] filter:filters)builder.queryParam(filter[0],filter[1]);URI uri=builder.build().encode().toUri();String body=client.get().uri(uri).retrieve().body(String.class);JsonNode root=json.readTree(body),section=root.path(dataset);if(!section.isArray()){JsonNode result=root.path("RESULT");String code=result.path("CODE").asText();if("INFO-200".equals(code))return saved;throw new IllegalStateException("NEIS returned "+(code.isBlank()?"an invalid response":code+" "+result.path("MESSAGE").asText()));}total=section.path(0).path("head").path(0).path("list_total_count").asInt();JsonNode rows=section.path(1).path("row");if(rows.isArray()){consumer.accept(rows);saved+=rows.size();}page++;}catch(Exception e){throw new IllegalStateException("NEIS "+dataset+" collection failed at page "+page,e);}}return saved;}
 private static String text(JsonNode row,String field){return row.path(field).asText("").trim();}private static LocalDate date(JsonNode row,String field){return LocalDate.parse(text(row,field),BASIC);}private static String clean(String value){return value.replaceAll("<br\\s*/?>"," · ").replaceAll("\\s+"," ").trim();}
 private static String truncate(String value){if(value==null)return "Unknown error";return value.length()>1000?value.substring(0,1000):value;}
 @FunctionalInterface interface PageConsumer{void accept(JsonNode rows);}
 public record Result(int mealCount,int scheduleCount,LocalDate businessDate,int schoolsProcessed,int nextSchoolOffset,int totalSchools,int failedSchools,String status){}
}
