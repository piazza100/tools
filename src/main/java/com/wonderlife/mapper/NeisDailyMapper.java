package com.wonderlife.mapper;

import org.apache.ibatis.annotations.*;
import java.time.LocalDate;
import java.util.List;

@Mapper public interface NeisDailyMapper{
 @Select("SELECT education_office_code office,school_code school FROM tools_education_schools ORDER BY education_office_code,school_code LIMIT #{limit} OFFSET #{offset}") List<SchoolKey> schools(@Param("offset")int offset,@Param("limit")int limit);
 @Select("SELECT COUNT(*) FROM tools_education_schools") int schoolTotal();
 @Select("SELECT next_school_offset FROM tools_neis_daily_batch_state WHERE id=1") int nextOffset();
 @Update("UPDATE tools_neis_daily_batch_state SET last_started_at=CURRENT_TIMESTAMP,last_status='RUNNING',last_error=NULL WHERE id=1") void startBatch();
 @Update("UPDATE tools_neis_daily_batch_state SET next_school_offset=#{next},completed_cycles=completed_cycles+#{cycle},last_finished_at=CURRENT_TIMESTAMP,last_status='SUCCESS' WHERE id=1") void finishBatch(@Param("next")int next,@Param("cycle")int cycle);
 @Update("UPDATE tools_neis_daily_batch_state SET next_school_offset=#{next},last_finished_at=CURRENT_TIMESTAMP,last_status='FAILED',last_error=#{error} WHERE id=1") void failBatch(@Param("next")int next,@Param("error")String error);
 @Insert("INSERT INTO tools_school_meals(education_office_code,school_code,meal_date,meal_code,meal_name,menu_text,origin_text,calorie_text,nutrition_text) VALUES(#{office},#{school},#{date},#{code},#{name},#{menu},#{origin},#{calorie},#{nutrition}) ON DUPLICATE KEY UPDATE meal_name=VALUES(meal_name),menu_text=VALUES(menu_text),origin_text=VALUES(origin_text),calorie_text=VALUES(calorie_text),nutrition_text=VALUES(nutrition_text),collected_at=CURRENT_TIMESTAMP") void upsertMeal(@Param("office")String office,@Param("school")String school,@Param("date")LocalDate date,@Param("code")String code,@Param("name")String name,@Param("menu")String menu,@Param("origin")String origin,@Param("calorie")String calorie,@Param("nutrition")String nutrition);
 @Insert("INSERT INTO tools_school_schedules(education_office_code,school_code,academic_year,event_date,event_name,event_content,grade_scope) VALUES(#{office},#{school},#{year},#{date},#{name},#{content},#{scope}) ON DUPLICATE KEY UPDATE academic_year=VALUES(academic_year),event_content=VALUES(event_content),grade_scope=VALUES(grade_scope),collected_at=CURRENT_TIMESTAMP") void upsertSchedule(@Param("office")String office,@Param("school")String school,@Param("year")int year,@Param("date")LocalDate date,@Param("name")String name,@Param("content")String content,@Param("scope")String scope);
 @Insert("<script>INSERT INTO tools_school_meals(education_office_code,school_code,meal_date,meal_code,meal_name,menu_text,origin_text,calorie_text,nutrition_text) VALUES <foreach collection='rows' item='r' separator=','>(#{r.office},#{r.school},#{r.date},#{r.code},#{r.name},#{r.menu},#{r.origin},#{r.calorie},#{r.nutrition})</foreach> ON DUPLICATE KEY UPDATE meal_name=VALUES(meal_name),menu_text=VALUES(menu_text),origin_text=VALUES(origin_text),calorie_text=VALUES(calorie_text),nutrition_text=VALUES(nutrition_text),collected_at=CURRENT_TIMESTAMP</script>") void upsertMeals(@Param("rows")List<MealRow> rows);
 @Insert("<script>INSERT INTO tools_school_schedules(education_office_code,school_code,academic_year,event_date,event_name,event_content,grade_scope) VALUES <foreach collection='rows' item='r' separator=','>(#{r.office},#{r.school},#{r.year},#{r.date},#{r.name},#{r.content},#{r.scope})</foreach> ON DUPLICATE KEY UPDATE academic_year=VALUES(academic_year),event_content=VALUES(event_content),grade_scope=VALUES(grade_scope),collected_at=CURRENT_TIMESTAMP</script>") void upsertSchedules(@Param("rows")List<ScheduleRow> rows);
 @Select("SELECT COUNT(*) FROM tools_school_meals WHERE meal_date=#{date}") long mealCount(LocalDate date);
 @Select("SELECT COUNT(DISTINCT school_code) FROM tools_school_meals WHERE meal_date=#{date}") long mealSchoolCount(LocalDate date);
 @Select("SELECT COUNT(*) FROM tools_school_schedules WHERE event_date BETWEEN #{from} AND #{to}") long scheduleCount(@Param("from")LocalDate from,@Param("to")LocalDate to);
 @Select("SELECT meal_name label,COUNT(*) value FROM tools_school_meals WHERE meal_date=#{date} GROUP BY meal_name ORDER BY value DESC") List<CountRow> mealTypes(LocalDate date);
 @Select("SELECT meal_date date,meal_name name,menu_text menu,calorie_text calorie FROM tools_school_meals WHERE education_office_code=#{office} AND school_code=#{school} AND meal_date BETWEEN #{from} AND #{to} ORDER BY meal_date,meal_code") List<MealView> schoolMeals(@Param("office")String office,@Param("school")String school,@Param("from")LocalDate from,@Param("to")LocalDate to);
 @Select("SELECT event_date date,event_name name,event_content content,grade_scope grade_scope FROM tools_school_schedules WHERE education_office_code=#{office} AND school_code=#{school} AND event_date BETWEEN #{from} AND #{to} ORDER BY event_date,event_name") List<ScheduleView> schoolSchedules(@Param("office")String office,@Param("school")String school,@Param("from")LocalDate from,@Param("to")LocalDate to);
 @Select("SELECT next_school_offset next_school_offset,completed_cycles,last_started_at,last_finished_at,last_status FROM tools_neis_daily_batch_state WHERE id=1") BatchStatus batchStatus();
 @Select("SELECT menu_text menu,calorie_text calorie FROM tools_school_meals WHERE meal_date=#{date}") List<MenuInput> menus(LocalDate date);
 @Select("SELECT event_date date,event_name name,COUNT(DISTINCT CONCAT(education_office_code,':',school_code)) school_count FROM tools_school_schedules WHERE event_date BETWEEN #{from} AND #{to} GROUP BY event_date,event_name ORDER BY event_date,school_count DESC") List<EventCount> events(@Param("from")LocalDate from,@Param("to")LocalDate to);
 record CountRow(String label,long value){}
 record MealRow(String office,String school,LocalDate date,String code,String name,String menu,String origin,String calorie,String nutrition){}
 record ScheduleRow(String office,String school,int year,LocalDate date,String name,String content,String scope){}
 record SchoolKey(String office,String school){}
 record BatchStatus(int nextSchoolOffset,int completedCycles,String lastStartedAt,String lastFinishedAt,String lastStatus){}
 record MealView(LocalDate date,String name,String menu,String calorie){}
 record ScheduleView(LocalDate date,String name,String content,String gradeScope){}
 record MenuInput(String menu,String calorie){}
 record EventCount(LocalDate date,String name,long schoolCount){}
}
