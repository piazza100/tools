package com.wonderlife.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import com.wonderlife.mapper.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.web.client.RestClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SchoolInfoSnapshotTest {
 @Test void failurePreservesSnapshot()throws Exception{check("{\"resultCode\":\"fail\",\"list\":[]}",false);}
 @Test void successfulEmptySnapshotReplacesPreviousRows()throws Exception{check("{\"resultCode\":\"success\",\"list\":[]}",true);}
 private void check(String body,boolean success)throws Exception{
  var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
  server.createContext("/",exchange->{byte[] bytes=body.getBytes(StandardCharsets.UTF_8);exchange.sendResponseHeaders(200,bytes.length);try(var out=exchange.getResponseBody()){out.write(bytes);}});server.start();
  try{
   var mapper=mock(SchoolInfoDisclosureMapper.class);var batch=mock(EducationBatchMapper.class);when(batch.anchorYear()).thenReturn(2026);
   var tx=mock(PlatformTransactionManager.class);when(tx.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
   var service=new SchoolInfoCollectionService("test-key","http://127.0.0.1:"+server.getAddress().getPort(),new ObjectMapper(),mapper,batch,tx,RestClient.builder());
   if(success){assertEquals(0,service.collect(1).rows());verify(mapper).deleteScopeMetrics(anyString(),eq(2026),anyString(),anyString());verify(mapper).deleteScope(anyString(),eq(2026),anyString(),anyString());verify(tx).commit(any());}
   else{assertThrows(IllegalStateException.class,()->service.collect(1));verify(mapper,never()).deleteScope(anyString(),anyInt(),anyString(),anyString());verify(mapper,never()).deleteScopeMetrics(anyString(),anyInt(),anyString(),anyString());verifyNoInteractions(tx);}
  }finally{server.stop(0);}
 }
}
