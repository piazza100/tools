package com.wonderlife.mapper;
import com.wonderlife.domain.HistoryRow;import org.apache.ibatis.annotations.*;import java.util.List;
@Mapper public interface WonderLifeMapper{
 @Insert("INSERT INTO tools_users(provider_subject,email,locale) VALUES(#{sub},#{email},#{locale}) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),email=VALUES(email),locale=VALUES(locale)") @Options(useGeneratedKeys=true,keyProperty="row.id") void upsertUser(@Param("sub")String sub,@Param("email")String email,@Param("locale")String locale,@Param("row")MutableId row);
 @Select("SELECT id,calculator_type,title,input_json,result_json,created_at FROM (SELECT id,calculator_type,title,input_json,result_json,created_at,ROW_NUMBER() OVER(PARTITION BY calculator_type ORDER BY created_at DESC,id DESC) AS history_rank FROM tools_calculation_histories WHERE user_id=#{userId}) ranked WHERE history_rank<=10 ORDER BY created_at DESC,id DESC") List<HistoryRow> histories(long userId);
 @Insert("INSERT INTO tools_calculation_histories(user_id,calculator_type,title,input_json,result_json) VALUES(#{userId},#{type},#{title},#{input},#{result})") @Options(useGeneratedKeys=true,keyProperty="row.id") void insert(@Param("userId")long userId,@Param("type")String type,@Param("title")String title,@Param("input")String input,@Param("result")String result,@Param("row")MutableId row);
 @Insert("<script>INSERT INTO tools_calculation_histories(user_id,calculator_type,title,input_json,result_json) VALUES <foreach collection='items' item='item' separator=','>(#{userId},#{item.calculatorType},#{item.title},#{item.inputJson},#{item.resultJson})</foreach></script>") void insertMany(@Param("userId")long userId,@Param("items")List<ImportHistory> items);
 @Select("SELECT id,calculator_type,title,input_json,result_json,created_at FROM tools_calculation_histories WHERE id=#{id} AND user_id=#{userId}") HistoryRow history(long id,long userId);
 @Delete("DELETE FROM tools_calculation_histories WHERE id=#{id} AND user_id=#{userId}") int delete(long id,long userId);
 class MutableId{public long id;public long getId(){return id;}public void setId(long id){this.id=id;}}
 record ImportHistory(String calculatorType,String title,String inputJson,String resultJson){}
}
