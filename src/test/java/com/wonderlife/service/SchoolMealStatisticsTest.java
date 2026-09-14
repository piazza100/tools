package com.wonderlife.service;
import com.wonderlife.mapper.NeisDailyMapper.MenuInput;
import java.util.List;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SchoolMealStatisticsTest {
 @Test void aggregateCountsMenusAndAllergyOncePerMeal(){
  var result=SchoolMealStatistics.aggregate(List.of(new MenuInput("쌀밥 · 된장국 (5.6.) · 김치 (5.6.9.)","700 Kcal"),new MenuInput("쌀밥 · 사과","800 Kcal")));
  assertEquals(new BigDecimal("750.0"),result.averageCalories());assertEquals(2,result.topMenus().get(0).count());assertEquals("쌀밥",result.topMenus().get(0).menu());assertEquals(1L,result.allergyMeals().get(5));
 }
 @Test void missingCaloriesAreNotZero(){var result=SchoolMealStatistics.aggregate(List.of(new MenuInput("쌀밥","-")));assertNull(result.averageCalories());assertEquals(0,result.calorieSamples());}
 @Test void zeroSamplesAreEmpty(){var result=SchoolMealStatistics.aggregate(List.of());assertTrue(result.topMenus().isEmpty());assertNull(result.averageCalories());}
}
