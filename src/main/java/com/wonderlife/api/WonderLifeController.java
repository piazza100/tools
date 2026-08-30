package com.wonderlife.api;
import com.wonderlife.domain.HistoryRow;import com.wonderlife.mapper.WonderLifeMapper;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import org.springframework.http.ResponseEntity;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.security.oauth2.core.user.OAuth2User;import org.springframework.security.web.csrf.CsrfToken;import org.springframework.transaction.annotation.Transactional;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api") public class WonderLifeController{
 private final WonderLifeMapper mapper;public WonderLifeController(WonderLifeMapper mapper){this.mapper=mapper;}
 private long user(OAuth2User p){String sub=p.getAttribute("sub"),email=p.getAttribute("email");if(sub==null||email==null)throw new IllegalArgumentException("Invalid account");var key=new WonderLifeMapper.MutableId();mapper.upsertUser(sub,email,"ko",key);return key.id;}
 @GetMapping("/csrf") Map<String,String> csrf(CsrfToken t){return Map.of("token",t.getToken());}
 @GetMapping("/me") Map<String,Object> me(@AuthenticationPrincipal OAuth2User p){return Map.of("id",0,"email",Objects.toString(p.getAttribute("email"),""));}
 @GetMapping("/histories") List<HistoryRow> histories(@AuthenticationPrincipal OAuth2User p){return mapper.histories(user(p));}
 @Transactional @PostMapping("/histories") HistoryRow save(@AuthenticationPrincipal OAuth2User p,@Valid @RequestBody SaveRequest r){long uid=user(p);var key=new WonderLifeMapper.MutableId();mapper.insert(uid,r.calculatorType(),r.title(),r.inputJson(),r.resultJson(),key);mapper.pruneHistories(uid);return mapper.history(key.id,uid);}
 @Transactional @PostMapping("/histories/import") List<HistoryRow> importHistories(@AuthenticationPrincipal OAuth2User p,@Valid @RequestBody ImportRequest request){long uid=user(p);if(!request.histories().isEmpty()){mapper.insertMany(uid,request.histories().stream().map(r->new WonderLifeMapper.ImportHistory(r.calculatorType(),r.title(),r.inputJson(),r.resultJson())).toList());mapper.pruneHistories(uid);}return mapper.histories(uid);}
 @DeleteMapping("/histories/{id}") ResponseEntity<Void> delete(@AuthenticationPrincipal OAuth2User p,@PathVariable long id){return mapper.delete(id,user(p))==1?ResponseEntity.noContent().build():ResponseEntity.notFound().build();}
 public record SaveRequest(@NotBlank @Size(max=40)String calculatorType,@NotBlank @Size(max=80)String title,@NotBlank @Size(max=10000)String inputJson,@NotBlank @Size(max=50000)String resultJson){}
 public record ImportRequest(@NotNull @Size(max=180) List<@Valid SaveRequest> histories){}
}
