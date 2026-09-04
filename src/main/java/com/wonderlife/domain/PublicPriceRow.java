package com.wonderlife.domain;

import java.math.BigDecimal;

public record PublicPriceRow(String date,String marketType,String categoryCode,String categoryName,
 String itemCode,String itemName,String varietyCode,String varietyName,String gradeCode,String gradeName,
 String regionCode,String regionName,String marketCode,String marketName,String unit,
 BigDecimal price,BigDecimal normalizedPrice,BigDecimal minPrice,BigDecimal averagePrice,BigDecimal maxPrice){}
