package com.wonderlife.mapper;
import java.math.BigDecimal;
import java.util.List;
import org.apache.ibatis.annotations.*;

@Mapper
public interface EducationTrendMapper {
 @Select("<script>SELECT publication_year year,SUM(CASE WHEN metric_code='student_count' THEN metric_value ELSE 0 END) students,COUNT(DISTINCT CASE WHEN metric_code='student_count' THEN school_code END) student_schools,SUM(CASE WHEN metric_code='class_count' THEN metric_value ELSE 0 END) classes,COUNT(DISTINCT CASE WHEN metric_code='class_count' THEN school_code END) class_schools,SUM(CASE WHEN metric_code='teacher_count' THEN metric_value ELSE 0 END) teachers,COUNT(DISTINCT CASE WHEN metric_code='teacher_count' THEN school_code END) teacher_schools FROM tools_schoolinfo_metrics WHERE publication_year BETWEEN #{year}-2 AND #{year}<if test='region != &quot;&quot;'> AND region_code LIKE CONCAT(#{region},'%')</if><if test='kind != &quot;&quot;'> AND school_kind_code=#{kind}</if> GROUP BY publication_year ORDER BY publication_year</script>")
 List<Annual> annual(@Param("year")int year,@Param("region")String region,@Param("kind")String kind);
 @Select("<script>SELECT LEFT(c.region_code,5) region,COUNT(*) matched_schools,SUM(p.metric_value) previous_students,SUM(c.metric_value) current_students FROM tools_schoolinfo_metrics c JOIN tools_schoolinfo_metrics p ON p.school_code=c.school_code AND p.metric_code='student_count' AND p.publication_year=#{year}-1 WHERE c.metric_code='student_count' AND c.publication_year=#{year}<if test='region != &quot;&quot;'> AND c.region_code LIKE CONCAT(#{region},'%')</if><if test='kind != &quot;&quot;'> AND c.school_kind_code=#{kind} AND p.school_kind_code=#{kind}</if> GROUP BY LEFT(c.region_code,5) ORDER BY region</script>")
 List<Change> changes(@Param("year")int year,@Param("region")String region,@Param("kind")String kind);
 @Select("SELECT s.region_code region,d.metric_code denominator_metric,SUM(s.metric_value) numerator,SUM(d.metric_value) denominator,COUNT(*) schools FROM tools_schoolinfo_metrics s JOIN tools_schoolinfo_metrics d ON s.school_code=d.school_code AND s.publication_year=d.publication_year WHERE s.publication_year=#{year} AND s.metric_code='student_count' AND d.metric_code IN ('class_count','teacher_count') AND d.metric_value>0 GROUP BY s.region_code,d.metric_code")
 List<Ratio> ratios(int year);
 record Annual(int year,BigDecimal students,long studentSchools,BigDecimal classes,long classSchools,BigDecimal teachers,long teacherSchools){}
 record Change(String region,long matchedSchools,BigDecimal previousStudents,BigDecimal currentStudents){}
 record Ratio(String region,String denominatorMetric,BigDecimal numerator,BigDecimal denominator,long schools){}
}
