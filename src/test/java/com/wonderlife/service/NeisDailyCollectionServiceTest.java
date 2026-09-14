package com.wonderlife.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import com.wonderlife.mapper.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NeisDailyCollectionServiceTest {
 @Test void failedSchoolDoesNotBlockNextSchool()throws Exception{
  var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
  server.createContext("/",exchange->{String query=exchange.getRequestURI().getQuery();String body=query.contains("SD_SCHUL_CODE=bad")?"{\"RESULT\":{\"CODE\":\"ERROR-300\"}}":"{\"RESULT\":{\"CODE\":\"INFO-200\"}}";byte[] bytes=body.getBytes(StandardCharsets.UTF_8);exchange.sendResponseHeaders(200,bytes.length);try(var out=exchange.getResponseBody()){out.write(bytes);}});server.start();
  try{
   var mapper=mock(NeisDailyMapper.class);var freshness=mock(EducationBatchMapper.class);
   when(mapper.schoolTotal()).thenReturn(2);when(mapper.schools(0,2)).thenReturn(List.of(new NeisDailyMapper.SchoolKey("B10","bad"),new NeisDailyMapper.SchoolKey("B10","good")));
   var service=new NeisDailyCollectionService("test-key","http://127.0.0.1:"+server.getAddress().getPort(),new ObjectMapper(),mapper,freshness,RestClient.builder());
   var result=service.collect(2);assertEquals("PARTIAL",result.status());assertEquals(1,result.failedSchools());assertEquals(2,result.schoolsProcessed());
   verify(freshness).failure("B10","bad");verify(freshness).success(eq("B10"),eq("good"),any());verify(freshness).checkpoint(1);verify(freshness).checkpoint(2);
  }finally{server.stop(0);}
 }
}
