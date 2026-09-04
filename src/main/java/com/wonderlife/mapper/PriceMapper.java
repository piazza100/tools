package com.wonderlife.mapper;

import com.wonderlife.domain.PriceDashboardItem;
import org.apache.ibatis.annotations.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper public interface PriceMapper{
 @Select("SELECT MAX(price_date) FROM tools_daily_price_snapshots") LocalDate latestDate();
 @Select("SELECT i.source_item_code item_code,i.item_name name,i.display_unit unit,1 quantity,s.original_price current_price,s.day_ago_price,s.week_ago_price,s.month_ago_price,s.year_ago_price FROM tools_daily_price_snapshots s JOIN tools_price_items i ON i.id=s.item_id WHERE s.price_date=(SELECT MAX(price_date) FROM tools_daily_price_snapshots) AND i.active=TRUE AND i.market_type='RETAIL' ORDER BY i.item_name LIMIT 30") List<PriceDashboardItem> latestItems();
 @Select("SELECT id FROM tools_price_collection_runs WHERE business_date=#{date}") Long runId(LocalDate date);
 @Select("SELECT status FROM tools_price_collection_runs WHERE id=#{id}") String runStatus(long id);
 @Insert("INSERT INTO tools_price_collection_runs(business_date,status) VALUES(#{date},'RUNNING')") @Options(useGeneratedKeys=true,keyProperty="row.id") void startRun(@Param("date")LocalDate date,@Param("row")MutableId row);
 @Update("UPDATE tools_price_collection_runs SET started_at=CURRENT_TIMESTAMP,finished_at=NULL,status='RUNNING',attempt_count=attempt_count+1,forced_at=CURRENT_TIMESTAMP,item_count=0,error_message=NULL WHERE id=#{id}") void restartRun(long id);
 @Update("UPDATE tools_price_collection_runs SET finished_at=CURRENT_TIMESTAMP,status='SUCCESS',item_count=#{count},error_message=NULL WHERE id=#{id}") void finishRun(@Param("id")long id,@Param("count")int count);
 @Update("UPDATE tools_price_collection_runs SET finished_at=CURRENT_TIMESTAMP,status='FAILED',error_message=#{message} WHERE id=#{id}") void failRun(@Param("id")long id,@Param("message")String message);
 @Insert("INSERT INTO tools_price_raw_responses(collection_run_id,page_no,response_json) VALUES(#{runId},#{pageNo},CAST(#{json} AS JSON)) ON DUPLICATE KEY UPDATE response_json=VALUES(response_json),created_at=CURRENT_TIMESTAMP") void insertRaw(@Param("runId")long runId,@Param("pageNo")int pageNo,@Param("json")String json);
 @Insert("INSERT INTO tools_price_items(source_item_code,variety_code,grade_code,item_name,variety_name,grade_name,display_unit,market_type) VALUES(#{itemCode},#{varietyCode},#{gradeCode},#{itemName},#{varietyName},#{gradeName},#{unit},#{marketType}) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),item_name=VALUES(item_name),variety_name=VALUES(variety_name),grade_name=VALUES(grade_name),display_unit=VALUES(display_unit),active=TRUE") @Options(useGeneratedKeys=true,keyProperty="row.id") void upsertItem(@Param("itemCode")String itemCode,@Param("varietyCode")String varietyCode,@Param("gradeCode")String gradeCode,@Param("itemName")String itemName,@Param("varietyName")String varietyName,@Param("gradeName")String gradeName,@Param("unit")String unit,@Param("marketType")String marketType,@Param("row")MutableId row);
 @Insert("INSERT INTO tools_daily_price_snapshots(item_id,price_date,original_price,normalized_kg_price,day_ago_price,week_ago_price,month_ago_price,year_ago_price) VALUES(#{itemId},#{date},#{current},#{normalized},#{dayAgo},#{weekAgo},#{monthAgo},#{yearAgo}) ON DUPLICATE KEY UPDATE original_price=VALUES(original_price),normalized_kg_price=VALUES(normalized_kg_price),day_ago_price=VALUES(day_ago_price),week_ago_price=VALUES(week_ago_price),month_ago_price=VALUES(month_ago_price),year_ago_price=VALUES(year_ago_price),collected_at=CURRENT_TIMESTAMP") void upsertSnapshot(@Param("itemId")long itemId,@Param("date")LocalDate date,@Param("current")BigDecimal current,@Param("normalized")BigDecimal normalized,@Param("dayAgo")BigDecimal dayAgo,@Param("weekAgo")BigDecimal weekAgo,@Param("monthAgo")BigDecimal monthAgo,@Param("yearAgo")BigDecimal yearAgo);
 class MutableId{public long id;public long getId(){return id;}public void setId(long id){this.id=id;}}
}
