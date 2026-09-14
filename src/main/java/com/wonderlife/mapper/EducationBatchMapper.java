package com.wonderlife.mapper;

import java.time.LocalDate;
import org.apache.ibatis.annotations.*;

@Mapper
public interface EducationBatchMapper {
 @Update("UPDATE tools_education_job_leases SET owner_id=#{owner},lease_until=DATE_ADD(CURRENT_TIMESTAMP,INTERVAL 2 HOUR) WHERE job_name=#{job} AND (lease_until IS NULL OR lease_until<CURRENT_TIMESTAMP)")
 int acquire(@Param("job")String job,@Param("owner")String owner);
 @Update("UPDATE tools_education_job_leases SET lease_until=DATE_ADD(CURRENT_TIMESTAMP,INTERVAL 2 HOUR) WHERE job_name=#{job} AND owner_id=#{owner} AND lease_until>CURRENT_TIMESTAMP")
 int renew(@Param("job")String job,@Param("owner")String owner);
 @Update("UPDATE tools_education_job_leases SET owner_id=NULL,lease_until=NULL WHERE job_name=#{job} AND owner_id=#{owner}")
 void release(@Param("job")String job,@Param("owner")String owner);
 @Select("SELECT last_success_date FROM tools_school_collection_freshness WHERE education_office_code=#{office} AND school_code=#{school}")
 LocalDate lastSuccess(@Param("office")String office,@Param("school")String school);
 @Insert("INSERT INTO tools_school_collection_freshness(education_office_code,school_code,last_success_date,last_attempt_at,last_status) VALUES(#{office},#{school},#{date},CURRENT_TIMESTAMP,'SUCCESS') ON DUPLICATE KEY UPDATE last_success_date=VALUES(last_success_date),last_attempt_at=CURRENT_TIMESTAMP,last_status='SUCCESS'")
 void success(@Param("office")String office,@Param("school")String school,@Param("date")LocalDate date);
 @Insert("INSERT INTO tools_school_collection_freshness(education_office_code,school_code,last_attempt_at,last_status) VALUES(#{office},#{school},CURRENT_TIMESTAMP,'FAILED') ON DUPLICATE KEY UPDATE last_attempt_at=CURRENT_TIMESTAMP,last_status='FAILED'")
 void failure(@Param("office")String office,@Param("school")String school);
 @Select("SELECT last_completed_date FROM tools_neis_daily_batch_state WHERE id=1") LocalDate dailyCompleted();
 @Update("UPDATE tools_neis_daily_batch_state SET last_completed_date=#{date} WHERE id=1") void completeDaily(LocalDate date);
 @Update("UPDATE tools_neis_daily_batch_state SET next_school_offset=#{offset} WHERE id=1") void checkpoint(int offset);
 @Update("UPDATE tools_neis_daily_batch_state SET last_status='PARTIAL' WHERE id=1") void partialDaily();
 @Select("SELECT anchor_year FROM tools_schoolinfo_batch_state WHERE id=1") int anchorYear();
 @Update("UPDATE tools_schoolinfo_batch_state SET anchor_year=#{year} WHERE id=1 AND next_scope_index=0") void setAnchorYear(int year);
 @Select("SELECT COUNT(*) FROM tools_school_collection_freshness WHERE last_success_date=#{date}") long freshSchools(LocalDate date);
 @Select("SELECT COUNT(*) FROM tools_school_collection_freshness WHERE last_status='FAILED'") long failedSchools();
}
