package com.wonderlife.service;
import com.fasterxml.jackson.databind.JsonNode;

final class SchoolInfoResponse {
 private SchoolInfoResponse(){}
 static void requireSuccess(JsonNode root){
  if(!"success".equals(root.path("resultCode").asText()))throw new IllegalStateException("SchoolInfo API returned an unsuccessful result");
  if(!root.path("list").isArray())throw new IllegalStateException("SchoolInfo API returned an invalid list");
 }
}
