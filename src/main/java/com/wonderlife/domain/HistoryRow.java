package com.wonderlife.domain;
import java.time.LocalDateTime;
public record HistoryRow(long id,String calculatorType,String title,String inputJson,String resultJson,LocalDateTime createdAt){}
