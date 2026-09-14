package com.wonderlife.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonderlife.domain.SchoolInfo;
import com.wonderlife.mapper.EducationStatisticsMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service public class NeisSchoolService{
 private static final String SOURCE="NEIS_SCHOOL";private static final ZoneId SEOUL=ZoneId.of("Asia/Seoul");
 private final String apiKey;private final String endpoint;private final RestClient client;private final ObjectMapper json;private final EducationStatisticsMapper mapper;
 public NeisSchoolService(@Value("${app.neis.api-key:}")String apiKey,@Value("${app.neis.endpoint}")String endpoint,RestClient.Builder builder,ObjectMapper json,EducationStatisticsMapper mapper){var factory=new JdkClientHttpRequestFactory();factory.setReadTimeout(Duration.ofSeconds(30));this.client=builder.requestFactory(factory).build();this.apiKey=apiKey;this.endpoint=endpoint;this.json=json;this.mapper=mapper;}
 public List<SchoolInfo> search(String name){String keyword=name==null?"":name.trim();if(keyword.length()<2)throw new IllegalArgumentException("학교명은 두 글자 이상 입력하세요.");return mapper.search(keyword);}
 public Result collect(boolean force){
  if(apiKey.isBlank())throw new IllegalStateException("NEIS_API_KEY is not configured");LocalDate date=LocalDate.now(SEOUL);Long existing=mapper.runId(date,SOURCE);
  if(existing!=null&&!force&&"SUCCESS".equals(mapper.runStatus(existing)))return new Result(existing,0,true,date,"SUCCESS");
  var run=new EducationStatisticsMapper.MutableId();if(existing==null)mapper.startRun(date,SOURCE,run);else{run.id=existing;mapper.restartRun(existing);}int saved=0;
  try{int page=1,total=Integer.MAX_VALUE,pageSize=1000;while((page-1)*pageSize<total){JsonNode root=request(page,pageSize);JsonNode section=root.path("schoolInfo");if(!section.isArray()){JsonNode result=root.path("RESULT");if("INFO-200".equals(result.path("CODE").asText()))break;throw new IllegalStateException("NEIS: "+result.path("MESSAGE").asText("invalid response"));}total=section.path(0).path("head").path(0).path("list_total_count").asInt();JsonNode rows=section.path(1).path("row");if(rows.isArray()){List<SchoolInfo> pageSchools=new java.util.ArrayList<>();rows.forEach(row->pageSchools.add(toSchool(row)));if(!pageSchools.isEmpty())mapper.upsertSchools(pageSchools,date);saved+=pageSchools.size();}page++;}mapper.finishRun(run.id,saved);return new Result(run.id,saved,false,date,"SUCCESS");}catch(Exception error){mapper.failRun(run.id,truncate(error.getMessage()));throw new IllegalStateException("NEIS school collection failed",error);}
 }
 private JsonNode request(int page,int size)throws Exception{URI uri=UriComponentsBuilder.fromUriString(endpoint+"/schoolInfo").queryParam("KEY",apiKey).queryParam("Type","json").queryParam("pIndex",page).queryParam("pSize",size).build().encode().toUri();String body=client.get().uri(uri).retrieve().body(String.class);if(body==null||body.isBlank())throw new IllegalStateException("Empty NEIS response");return json.readTree(body);}
 private static SchoolInfo toSchool(JsonNode row){return new SchoolInfo(text(row,"ATPT_OFCDC_SC_CODE"),text(row,"SD_SCHUL_CODE"),text(row,"ATPT_OFCDC_SC_NM"),text(row,"SCHUL_NM"),text(row,"SCHUL_KND_SC_NM"),text(row,"LCTN_SC_NM"),text(row,"ORG_RDNMA"),text(row,"COEDU_SC_NM"),text(row,"HMPG_ADRES"),text(row,"FOND_SC_NM"),text(row,"OPER_YN"),text(row,"FOND_YMD"));}
 private static String text(JsonNode row,String field){return row.path(field).asText("").trim();}private static String truncate(String value){if(value==null)return "Unknown error";return value.length()>1000?value.substring(0,1000):value;}
 public record Result(long runId,int itemCount,boolean alreadyCollected,LocalDate businessDate,String status){}
}
