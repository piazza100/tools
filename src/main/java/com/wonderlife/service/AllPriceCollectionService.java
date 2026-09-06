package com.wonderlife.service;

import org.springframework.stereotype.Service;

@Service public class AllPriceCollectionService{
 private final PriceCollectionService recent;private final PublicPriceCollectionService publicPrices;
 public AllPriceCollectionService(PriceCollectionService recent,PublicPriceCollectionService publicPrices){this.recent=recent;this.publicPrices=publicPrices;}
 public Result collect(boolean force){Task recentTask;try{PriceCollectionService.Result value=recent.collect(force);recentTask=new Task("RECENT",value.status(),value.itemCount(),value.alreadyCollected(),"");}catch(Exception error){recentTask=new Task("RECENT","FAILED",0,false,message(error));}PublicPriceCollectionService.Results values=publicPrices.collect(force);Task period=task(values.periodRetail()),regional=task(values.regional());return new Result("SUCCESS".equals(recentTask.status())&&"SUCCESS".equals(period.status())&&"SUCCESS".equals(regional.status()),recentTask,period,regional);}
 private static Task task(PublicPriceCollectionService.Result value){return new Task(value.source(),value.status(),value.itemCount(),value.alreadyCollected(),value.message());}private static String message(Exception error){String value=error.getMessage();return value==null?"Unknown error":value;}
 public record Task(String source,String status,int itemCount,boolean alreadyCollected,String message){}public record Result(boolean success,Task recent,Task periodRetail,Task regional){}
}
