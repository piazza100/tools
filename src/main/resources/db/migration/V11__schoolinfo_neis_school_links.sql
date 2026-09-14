CREATE TABLE tools_schoolinfo_school_links (
 schoolinfo_code VARCHAR(20) PRIMARY KEY,
 education_office_code VARCHAR(20) NOT NULL,
 neis_school_code VARCHAR(20) NOT NULL,
 match_basis VARCHAR(40) NOT NULL DEFAULT 'UNIQUE_OFFICE_NAME_KIND',
 matched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY ix_schoolinfo_neis(education_office_code,neis_school_code)
);
INSERT INTO tools_schoolinfo_school_links(schoolinfo_code,education_office_code,neis_school_code)
SELECT d.school_code,MIN(s.education_office_code),MIN(s.school_code)
FROM tools_schoolinfo_disclosures d
JOIN tools_education_schools s ON s.school_name=d.school_name
 AND s.education_office_name=JSON_UNQUOTE(JSON_EXTRACT(d.payload,'$.ATPT_OFCDC_ORG_NM'))
 AND s.school_kind=CASE d.school_kind_code WHEN '02' THEN '초등학교' WHEN '03' THEN '중학교' WHEN '04' THEN '고등학교' WHEN '05' THEN '특수학교' WHEN '07' THEN '각종학교' ELSE '' END
GROUP BY d.school_code HAVING COUNT(DISTINCT CONCAT(s.education_office_code,':',s.school_code))=1;
