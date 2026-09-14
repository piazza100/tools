package com.wonderlife.api;
import com.wonderlife.mapper.EducationTrendMapper;
import java.time.*;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/public/education")
public class EducationTrendController {
 private final EducationTrendMapper mapper;
 public EducationTrendController(EducationTrendMapper mapper){this.mapper=mapper;}
 @GetMapping("/trends") public Trends trends(@RequestParam(required=false)Integer year,@RequestParam(defaultValue="")String region,@RequestParam(defaultValue="")String kind){
  int target=year==null?Year.now(ZoneId.of("Asia/Seoul")).getValue():year;
  if(target<2000||target>2100||(!region.isBlank()&&!region.matches("[0-9]{2,10}"))||(!kind.isBlank()&&!List.of("02","03","04","05","06","07").contains(kind)))throw new IllegalArgumentException("Invalid education trend filters");
  return new Trends(target,mapper.annual(target,region,kind),mapper.changes(target,region,kind));
 }
 @GetMapping("/ratios") public List<EducationTrendMapper.Ratio> ratios(@RequestParam int year){if(year<2000||year>2100)throw new IllegalArgumentException("Invalid year");return mapper.ratios(year);}
 public record Trends(int year,List<EducationTrendMapper.Annual> annual,List<EducationTrendMapper.Change> changes){}
}
