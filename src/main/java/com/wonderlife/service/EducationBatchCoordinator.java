package com.wonderlife.service;

import com.wonderlife.mapper.EducationBatchMapper;
import com.wonderlife.mapper.SchoolInfoDisclosureMapper;
import java.time.*;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/** Short restartable chunks; the daily trigger is not a single oversized HTTP request. */
@Service
public class EducationBatchCoordinator {
 private static final Logger log=LoggerFactory.getLogger(EducationBatchCoordinator.class);
 private final EducationBatchMapper jobs;
 private final NeisSchoolService schools;
 private final NeisDailyCollectionService daily;
 private final SchoolInfoCollectionService disclosures;
 private final SchoolInfoDisclosureMapper disclosureMapper;
 private final boolean enabled;
 private final String neisKey,schoolInfoKey;
 private final int schoolChunk,disclosureChunk;
 public EducationBatchCoordinator(EducationBatchMapper jobs,NeisSchoolService schools,NeisDailyCollectionService daily,SchoolInfoCollectionService disclosures,SchoolInfoDisclosureMapper disclosureMapper,
  @Value("${app.education.batch-enabled:true}")boolean enabled,@Value("${app.neis.api-key:}")String neisKey,@Value("${app.schoolinfo.api-key:}")String schoolInfoKey,
  @Value("${app.education.school-chunk:50}")int schoolChunk,@Value("${app.education.disclosure-chunk:30}")int disclosureChunk){
  this.jobs=jobs;this.schools=schools;this.daily=daily;this.disclosures=disclosures;this.disclosureMapper=disclosureMapper;this.enabled=enabled;this.neisKey=neisKey;this.schoolInfoKey=schoolInfoKey;this.schoolChunk=schoolChunk;this.disclosureChunk=disclosureChunk;
 }
 @Scheduled(fixedDelayString="${app.education.chunk-delay-ms:60000}",initialDelayString="${app.education.initial-delay-ms:60000}")
 public void continueDaily(){
  if(!enabled)return;
  if(!neisKey.isBlank())try{collectDaily(schoolChunk,false);}catch(Exception e){log.warn("NEIS batch chunk failed; persisted checkpoints will be retried");}
 }
 @Scheduled(fixedDelayString="${app.education.chunk-delay-ms:60000}",initialDelayString="${app.education.initial-delay-ms:60000}")
 public void continueDisclosures(){if(enabled&&!schoolInfoKey.isBlank())try{collectDisclosures(disclosureChunk,false);}catch(Exception e){log.warn("SchoolInfo batch chunk failed; persisted checkpoints will be retried");}}
 public NeisDailyCollectionService.Result collectDaily(int limit,boolean force){
  String owner=UUID.randomUUID().toString();if(jobs.acquire("NEIS_DAILY",owner)==0)throw new IllegalStateException("NEIS batch is already running");
  try{LocalDate today=LocalDate.now(ZoneId.of("Asia/Seoul"));if(!force&&today.equals(jobs.dailyCompleted()))return null;schools.collect(false);return daily.collect(limit,()->heartbeat("NEIS_DAILY",owner));}finally{jobs.release("NEIS_DAILY",owner);}
 }
 public SchoolInfoCollectionService.Result collectDisclosures(int limit,boolean force){
  String owner=UUID.randomUUID().toString();if(jobs.acquire("SCHOOLINFO",owner)==0)throw new IllegalStateException("SchoolInfo batch is already running");
  try{var state=disclosureMapper.status();if(!force&&state.nextIndex()==0&&state.completedCycles()>0&&state.lastFinishedAt()!=null){var finished=LocalDateTime.parse(state.lastFinishedAt().replace(' ','T'));if(finished.isAfter(LocalDateTime.now(ZoneOffset.UTC).minusDays(7)))return null;}return disclosures.collect(limit,()->heartbeat("SCHOOLINFO",owner));}finally{jobs.release("SCHOOLINFO",owner);}
 }
 private void heartbeat(String job,String owner){if(jobs.renew(job,owner)==0)throw new IllegalStateException("Education batch lease was lost");}
}
