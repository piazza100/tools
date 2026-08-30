package com.wonderlife.domain;

import java.time.LocalDateTime;

public record ShareRow(String shareToken,String calculatorType,String title,String inputJson,String resultJson,LocalDateTime createdAt){}
