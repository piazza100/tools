package com.wonderlife.service;
import java.time.LocalDate;

final class EducationCollectionWindow {
 private EducationCollectionWindow(){}
 static LocalDate from(LocalDate today,LocalDate lastSuccess){
  // Initial historical backfill; subsequent runs catch up every missed date, with a correction overlap.
  return lastSuccess==null?today.minusDays(365):lastSuccess.minusDays(7);
 }
}
