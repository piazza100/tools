package com.wonderlife.service;

import com.wonderlife.mapper.NeisDailyMapper.MenuInput;
import java.math.*;
import java.util.*;
import java.util.regex.Pattern;

public final class SchoolMealStatistics {
 private static final Pattern ALLERGY=Pattern.compile("\\(([0-9.]+)\\)");
 private SchoolMealStatistics(){}
 public static Result aggregate(List<MenuInput> rows){
  Map<String,Long> menus=new HashMap<>();Map<Integer,Long> allergies=new TreeMap<>();BigDecimal calories=BigDecimal.ZERO;int calorieSamples=0;
  for(var row:rows){
   Set<Integer> mealAllergies=new HashSet<>();
   for(String dish:Objects.toString(row.menu(),"").split(" · |<br\\s*/?>")){
    var matcher=ALLERGY.matcher(dish);while(matcher.find())for(String code:matcher.group(1).split("\\."))try{int id=Integer.parseInt(code);if(id>=1&&id<=19)mealAllergies.add(id);}catch(NumberFormatException ignored){}
    String normalized=ALLERGY.matcher(dish).replaceAll("").replaceAll("[*!]+$","").trim();
    if(!normalized.isBlank())menus.merge(normalized,1L,Long::sum);
   }
   mealAllergies.forEach(code->allergies.merge(code,1L,Long::sum));
   try{String value=Objects.toString(row.calorie(),"").replaceAll("[^0-9.]","");if(!value.isBlank()){BigDecimal kcal=new BigDecimal(value);if(kcal.signum()>0){calories=calories.add(kcal);calorieSamples++;}}}catch(NumberFormatException ignored){}
  }
  var top=menus.entrySet().stream().sorted(Map.Entry.<String,Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey())).limit(30).map(e->new MenuCount(e.getKey(),e.getValue())).toList();
  return new Result(rows.size(),calorieSamples,calorieSamples==0?null:calories.divide(BigDecimal.valueOf(calorieSamples),1,RoundingMode.HALF_UP),top,allergies);
 }
 public record MenuCount(String menu,long count){}
 public record Result(int mealSamples,int calorieSamples,BigDecimal averageCalories,List<MenuCount> topMenus,Map<Integer,Long> allergyMeals){}
}
