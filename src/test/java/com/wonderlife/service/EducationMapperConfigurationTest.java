package com.wonderlife.service;
import org.junit.jupiter.api.Test;
import org.apache.ibatis.session.Configuration;
import com.wonderlife.mapper.*;
import static org.junit.jupiter.api.Assertions.*;

class EducationMapperConfigurationTest {
 @Test void allEducationMappersRegisterWithoutDatabase(){assertDoesNotThrow(()->{var configuration=new Configuration();configuration.addMapper(EducationBatchMapper.class);configuration.addMapper(EducationTrendMapper.class);configuration.addMapper(EducationStatisticsMapper.class);configuration.addMapper(NeisDailyMapper.class);configuration.addMapper(SchoolInfoDisclosureMapper.class);});}
}
