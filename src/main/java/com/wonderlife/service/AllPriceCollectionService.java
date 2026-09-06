package com.wonderlife.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.CompletableFuture;

@Service public class AllPriceCollectionService{
 private final PriceCollectionService recent;private final PublicPriceCollectionService publicPrices;
 public AllPriceCollectionService(PriceCollectionService recent,PublicPriceCollectionService publicPrices){this.recent=recent;this.publicPrices=publicPrices;}
 public Result collect(boolean force){
  CompletableFuture<Task> recentFuture=CompletableFuture.supplyAsync(()->collectRecent(force));
  CompletableFuture<PublicPriceCollectionService.Results> publicFuture=CompletableFuture.supplyAsync(()->publicPrices.collect(force));
  Task recentTask=recentFuture.join();PublicPriceCollectionService.Results values=publicFuture.join();Task period=task(values.periodRetail()),regional=task(values.regional());
  return new Result("SUCCESS".equals(recentTask.status())&&"SUCCESS".equals(period.status())&&"SUCCESS".equals(regional.status()),recentTask,period,regional);
 }
 private Task collectRecent(boolean force){try{PriceCollectionService.Result value=recent.collect(force);return new Task("RECENT",value.status(),value.itemCount(),value.alreadyCollected(),"");}catch(Exception error){return new Task("RECENT","FAILED",0,false,message(error));}}
 private static Task task(PublicPriceCollectionService.Result value){return new Task(value.source(),value.status(),value.itemCount(),value.alreadyCollected(),value.message());}private static String message(Exception error){String value=error.getMessage();return value==null?"Unknown error":value;}
 public record Task(String source,String status,int itemCount,boolean alreadyCollected,String message){}public record Result(boolean success,Task recent,Task periodRetail,Task regional){}
}
