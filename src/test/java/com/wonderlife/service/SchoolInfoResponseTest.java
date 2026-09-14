package com.wonderlife.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SchoolInfoResponseTest {
 private final ObjectMapper json=new ObjectMapper();
 @Test void successfulEmptyListIsValid()throws Exception{assertDoesNotThrow(()->SchoolInfoResponse.requireSuccess(json.readTree("{\"resultCode\":\"success\",\"list\":[]}")));}
 @Test void failedResponseCannotBecomeZeroRows()throws Exception{var root=json.readTree("{\"resultCode\":\"fail\",\"list\":[]}");assertThrows(IllegalStateException.class,()->SchoolInfoResponse.requireSuccess(root));}
 @Test void malformedListIsRejected()throws Exception{var root=json.readTree("{\"resultCode\":\"success\"}");assertThrows(IllegalStateException.class,()->SchoolInfoResponse.requireSuccess(root));}
}
