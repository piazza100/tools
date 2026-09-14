package com.wonderlife.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonderlife.mapper.SchoolInfoDisclosureMapper;
import com.wonderlife.mapper.EducationBatchMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Duration;
import java.time.Year;
import java.util.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service public class SchoolInfoCollectionService{
 private final String key,endpoint;private final ObjectMapper json;private final SchoolInfoDisclosureMapper mapper;private final RestClient client;private final EducationBatchMapper batch;private final org.springframework.transaction.support.TransactionTemplate transactions;
 public SchoolInfoCollectionService(@Value("${app.schoolinfo.api-key:}")String key,@Value("${app.schoolinfo.endpoint}")String endpoint,ObjectMapper json,SchoolInfoDisclosureMapper mapper,EducationBatchMapper batch,org.springframework.transaction.PlatformTransactionManager transactionManager,RestClient.Builder builder){this.transactions=new org.springframework.transaction.support.TransactionTemplate(transactionManager);this.batch=batch;this.key=key;this.endpoint=endpoint;this.json=json;this.mapper=mapper;var factory=new JdkClientHttpRequestFactory();factory.setReadTimeout(Duration.ofSeconds(25));this.client=builder.requestFactory(factory).build();}
 public List<String> apiTypes(){return SchoolInfoScopes.TYPES;}
 public int totalScopes(){return scopesPerYear()*3;}
 private int scopesPerYear(){return SchoolInfoScopes.TYPES.size()*SchoolInfoScopes.regions().size()*SchoolInfoScopes.KINDS.size();}
 public Result collect(int limit){return collect(limit,()->{});}
 public Result collect(int limit,Runnable heartbeat){if(key.isBlank())throw new IllegalStateException("SCHOOLINFO_API_KEY is not configured");int safeLimit=Math.max(1,Math.min(limit,30));List<SchoolInfoScopes.Region> regions=SchoolInfoScopes.regions();int total=totalScopes(),index=Math.floorMod(mapper.nextIndex(),total),requests=0,rows=0,cycles=0;if(index==0)batch.setAnchorYear(Year.now(java.time.ZoneId.of("Asia/Seoul")).getValue());int anchor=batch.anchorYear();mapper.start();try{while(requests<safeLimit){heartbeat.run();Scope scope=scope(index,regions,anchor);rows+=collectScope(scope);requests++;index++;if(index>=total){index=0;cycles++;break;}}mapper.finish(index,cycles);return new Result(requests,rows,index,total,cycles>0,"SUCCESS");}catch(Exception error){mapper.fail(index,truncate(error.getMessage()));throw new IllegalStateException("SchoolInfo collection failed at scope "+index,error);}}
 private Scope scope(int index,List<SchoolInfoScopes.Region> regions,int anchor){int perYear=SchoolInfoScopes.TYPES.size()*regions.size()*SchoolInfoScopes.KINDS.size(),yearOffset=index/perYear,withinYear=index%perYear;int kindIndex=withinYear%SchoolInfoScopes.KINDS.size();int regionIndex=(withinYear/SchoolInfoScopes.KINDS.size())%regions.size();int typeIndex=withinYear/(SchoolInfoScopes.KINDS.size()*regions.size());return new Scope(SchoolInfoScopes.TYPES.get(typeIndex),regions.get(regionIndex),SchoolInfoScopes.KINDS.get(kindIndex),anchor-yearOffset);}
 private int collectScope(Scope s)throws Exception{
  var uri=UriComponentsBuilder.fromUriString(endpoint).queryParam("apiKey",key).queryParam("apiType",s.type).queryParam("sidoCode",s.region.sido()).queryParam("sggCode",s.region.sgg()).queryParam("schulKndCode",s.kind).queryParam("pbanYr",s.year).build().encode().toUri();
  String body=client.get().uri(uri).retrieve().body(String.class);JsonNode root=json.readTree(body);SchoolInfoResponse.requireSuccess(root);
  List<SchoolInfoDisclosureMapper.RawInput> raw=new ArrayList<>();List<SchoolInfoDisclosureMapper.MetricInput> metrics=new ArrayList<>();Map<String,JsonNode> schools=new LinkedHashMap<>();
  for(JsonNode row:root.path("list")){
   String school=text(row,"SCHUL_CODE");if(school.isBlank())throw new IllegalStateException("SchoolInfo row has no school identifier");
   String region=text(row,"ADRCD_CD"),kind=text(row,"SCHUL_KND_SC_CODE"),payload=json.writeValueAsString(row);region=region.isBlank()?s.region.sgg():region;kind=kind.isBlank()?s.kind:kind;
   raw.add(new SchoolInfoDisclosureMapper.RawInput(s.type,s.year,school,hash(payload),kind,region,text(row,"ADRCD_NM"),text(row,"SCHUL_NM"),payload,s.region.sgg(),s.kind));
   extractMetrics(s.type,s.year,school,region,kind,row,metrics);schools.put(school,row);
  }
  transactions.executeWithoutResult(status->{
   // A successful scope replaces its previous snapshot atomically; failed calls never delete data.
   mapper.deleteScopeMetrics(s.type,s.year,s.region.sgg(),s.kind);mapper.deleteScope(s.type,s.year,s.region.sgg(),s.kind);
   for(int i=0;i<raw.size();i+=200)mapper.upsertRows(raw.subList(i,Math.min(i+200,raw.size())));
   for(int i=0;i<metrics.size();i+=500)mapper.upsertMetricRows(metrics.subList(i,Math.min(i+500,metrics.size())));
   schools.forEach((code,row)->mapper.linkSchool(code,text(row,"SCHUL_NM"),text(row,"ATPT_OFCDC_ORG_NM"),text(row,"SCHUL_KND_SC_CODE").isBlank()?s.kind:text(row,"SCHUL_KND_SC_CODE")));
  });
  return raw.size();
 }
 private void extractMetrics(String type,int year,String school,String region,String kind,JsonNode row,List<SchoolInfoDisclosureMapper.MetricInput> metrics){Map<String,String[]> fields=switch(type){case "09"->Map.of("class_count",new String[]{"COL_C_SUM","COL_SUM_C4"},"student_count",new String[]{"COL_S_SUM","COL_SUM_S4"},"students_per_class",new String[]{"COL_SUM","COL_SUM_4"},"teacher_count",new String[]{"TEACH_CNT"},"students_per_teacher",new String[]{"TEACH_CAL"});case "63"->Map.of("male_students",new String[]{"COL_MSUM","COL_MSUM4"},"female_students",new String[]{"COL_WSUM","COL_WSUM4"},"student_count",new String[]{"SUM","COL_SUM"});case "22"->Map.of("teacher_count",new String[]{"COL_S"});case "58"->Map.of("library_books",new String[]{"SUMCNT"},"books_per_student",new String[]{"RATIO"});case "34"->Map.of("meal_students",new String[]{"MLSV_STDNT_FGR"},"meal_rate",new String[]{"KS_RATE"});case "59"->Map.of("after_school_programs",new String[]{"SUM_ASL_PGM_FGR"},"after_school_students",new String[]{"SUM_ASL_REG_STDNT_FGR"});default->Map.of();};fields.forEach((metric,candidates)->{BigDecimal value=number(row,candidates);if(value!=null)metrics.add(new SchoolInfoDisclosureMapper.MetricInput(year,school,region,kind,metric,value,type));});}
 private static BigDecimal number(JsonNode row,String[] fields){for(String field:fields){String value=text(row,field).replace(",","").replace("%","");if(!value.isBlank())try{return new BigDecimal(value);}catch(NumberFormatException ignored){}}return null;}private static String text(JsonNode row,String field){return row.path(field).asText("").trim();}private static String truncate(String value){if(value==null)return "Unknown error";return value.length()>1000?value.substring(0,1000):value;}
 private static String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
 record Scope(String type,SchoolInfoScopes.Region region,String kind,int year){}public record Result(int requests,int rows,int nextScope,int totalScopes,boolean cycleCompleted,String status){}
}
