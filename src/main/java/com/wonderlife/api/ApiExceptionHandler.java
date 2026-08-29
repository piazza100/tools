package com.wonderlife.api;
import org.springframework.http.*;import org.springframework.web.bind.MethodArgumentNotValidException;import org.springframework.web.bind.annotation.*;import java.util.Map;
@RestControllerAdvice public class ApiExceptionHandler{@ExceptionHandler({IllegalArgumentException.class,MethodArgumentNotValidException.class})ResponseEntity<Map<String,String>> bad(Exception e){return ResponseEntity.badRequest().body(Map.of("message","입력값을 확인해 주세요."));}}
