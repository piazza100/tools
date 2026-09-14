package com.wonderlife.api;

import com.wonderlife.domain.SchoolInfo;
import com.wonderlife.service.NeisSchoolService;
import com.wonderlife.service.SchoolInfoCollectionService;
import com.wonderlife.domain.EducationRegionSummary;
import com.wonderlife.mapper.EducationStatisticsMapper;
import com.wonderlife.mapper.NeisDailyMapper;
import com.wonderlife.mapper.SchoolInfoDisclosureMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController @RequestMapping("/api/public/education") public class EducationStatisticsController{
 private final NeisSchoolService service;private final EducationStatisticsMapper mapper;private final NeisDailyMapper daily;private final SchoolInfoDisclosureMapper disclosures;private final SchoolInfoCollectionService disclosureCollector;private final com.wonderlife.mapper.EducationBatchMapper freshness;public EducationStatisticsController(NeisSchoolService service,EducationStatisticsMapper mapper,NeisDailyMapper daily,SchoolInfoDisclosureMapper disclosures,SchoolInfoCollectionService disclosureCollector,com.wonderlife.mapper.EducationBatchMapper freshness){this.freshness=freshness;this.service=service;this.mapper=mapper;this.daily=daily;this.disclosures=disclosures;this.disclosureCollector=disclosureCollector;}
 @GetMapping("/schools") public List<SchoolInfo> schools(@RequestParam String name){return service.search(name);}
 @GetMapping("/school-pages") public List<EducationStatisticsMapper.SchoolPage> schoolPages(){return mapper.indexableSchools();}
 @GetMapping("/schools/{office}/{school}") public SchoolDetail school(@PathVariable String office,@PathVariable String school){SchoolInfo info=mapper.find(office,school);if(info==null)throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND,"학교를 찾을 수 없습니다.");java.time.LocalDate today=java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul"));return new SchoolDetail(info,disclosures.linkedMetrics(office,school),daily.schoolMeals(office,school,today.minusDays(365),today.plusDays(90)),daily.schoolSchedules(office,school,today.minusDays(365),today.plusDays(90)));}
 @GetMapping("/summary") public Summary summary(){return new Summary(mapper.latestDate(),mapper.summaries());}
 @GetMapping("/daily-summary") public DailySummary dailySummary(@RequestParam(required=false)java.time.LocalDate date){java.time.LocalDate target=date==null?java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul")):date;return new DailySummary(target,daily.mealCount(target),daily.mealSchoolCount(target),daily.scheduleCount(target,target.plusDays(30)),daily.mealTypes(target),daily.batchStatus(),daily.schoolTotal(),freshness.freshSchools(target),freshness.failedSchools(),com.wonderlife.service.SchoolMealStatistics.aggregate(daily.menus(target)),daily.events(target,target.plusDays(30)));}
 @GetMapping("/disclosure-summary") public DisclosureSummary disclosureSummary(@RequestParam(required=false)Integer year){int target=year==null?(disclosures.latestYear()==null?java.time.Year.now().getValue():disclosures.latestYear()):year;return new DisclosureSummary(target,disclosures.summaries(target),disclosures.status(),disclosureCollector.totalScopes());}
 public record Summary(java.time.LocalDate asOfDate,List<EducationRegionSummary> regions){}
 @GetMapping("/disclosure-types") public List<String> disclosureTypes(){return disclosureCollector.apiTypes();}
 @GetMapping("/disclosures") public DisclosurePage disclosurePage(@RequestParam int year,@RequestParam(defaultValue="")String type,@RequestParam(defaultValue="")String region,@RequestParam(defaultValue="")String name,@RequestParam(defaultValue="0")int page){
  if(year<2000||year>2100||page<0||page>100000||(!type.isBlank()&&!disclosureCollector.apiTypes().contains(type))||(!region.isBlank()&&!region.matches("[0-9]{2,10}"))||name.length()>80)throw new IllegalArgumentException("Invalid disclosure filters");
  int size=50;return new DisclosurePage(page,size,disclosures.browseCount(year,type,region,name),disclosures.browse(year,type,region,name,size,page*size));
 }
 public record DisclosurePage(int page,int pageSize,long total,List<SchoolInfoDisclosureMapper.DisclosureRow> items){}
 public record DailySummary(java.time.LocalDate date,long mealCount,long mealSchoolCount,long upcomingScheduleCount,List<NeisDailyMapper.CountRow> mealTypes,NeisDailyMapper.BatchStatus batch,int totalSchools,long freshSchools,long failedSchools,com.wonderlife.service.SchoolMealStatistics.Result mealStatistics,List<NeisDailyMapper.EventCount> events){}
 public record DisclosureSummary(int year,List<SchoolInfoDisclosureMapper.MetricSummary> metrics,SchoolInfoDisclosureMapper.BatchStatus batch,int totalScopes){}
 public record SchoolDetail(SchoolInfo school,List<SchoolInfoDisclosureMapper.SchoolMetric> metrics,List<NeisDailyMapper.MealView> meals,List<NeisDailyMapper.ScheduleView> schedules){}
}
