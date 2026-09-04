package com.wonderlife.config;
import org.springframework.beans.factory.annotation.Value;import org.springframework.context.annotation.Bean;import org.springframework.context.annotation.Configuration;import org.springframework.http.HttpStatus;import org.springframework.security.config.annotation.web.builders.HttpSecurity;import org.springframework.security.web.SecurityFilterChain;import org.springframework.security.web.authentication.HttpStatusEntryPoint;import org.springframework.security.web.csrf.CookieCsrfTokenRepository;import org.springframework.security.web.util.matcher.RequestMatcher;
@Configuration public class SecurityConfig{
 @Bean SecurityFilterChain securityFilterChain(HttpSecurity http,@Value("${app.frontend-url}")String frontendUrl)throws Exception{
  RequestMatcher api=r->r.getRequestURI().startsWith("/api/");RequestMatcher logout=r->"GET".equals(r.getMethod())&&"/logout".equals(r.getRequestURI());
  RequestMatcher priceJob=r->"POST".equals(r.getMethod())&&"/api/internal/prices/collect".equals(r.getRequestURI());
  return http.authorizeHttpRequests(a->a.requestMatchers("/actuator/health","/oauth2/**","/login/**","/error","/api/public/shares/**","/api/public/prices/**","/api/public/price-lookup/**").permitAll().requestMatchers(priceJob).permitAll().requestMatchers("/api/**").authenticated().anyRequest().permitAll())
   .oauth2Login(o->o.defaultSuccessUrl(frontendUrl,true).failureHandler((q,s,e)->s.sendRedirect(frontendUrl)))
   .exceptionHandling(e->e.defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),api))
   .logout(l->l.logoutRequestMatcher(logout).logoutSuccessUrl(frontendUrl).deleteCookies("JSESSIONID"))
   .csrf(c->c.ignoringRequestMatchers(priceJob).csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())).build();
 }
}
