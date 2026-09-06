package com.wonderlife.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StoredPublicPriceRow(String sourceType,LocalDate collectedDate,LocalDate priceDate,String marketType,
 String categoryCode,String categoryName,String itemCode,String itemName,String varietyCode,String varietyName,
 String gradeCode,String gradeName,String regionCode,String regionName,String marketCode,String marketName,
 String unit,String unitSize,BigDecimal price,BigDecimal normalizedPrice,BigDecimal minPrice,BigDecimal averagePrice,BigDecimal maxPrice){}
