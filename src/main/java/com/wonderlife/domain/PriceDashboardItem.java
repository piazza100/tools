package com.wonderlife.domain;

import java.math.BigDecimal;

public record PriceDashboardItem(String itemCode,String name,String unit,int quantity,BigDecimal currentPrice,
 BigDecimal dayAgoPrice,BigDecimal weekAgoPrice,BigDecimal monthAgoPrice,BigDecimal yearAgoPrice){}
